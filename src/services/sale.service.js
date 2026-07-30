const mongoose = require('mongoose');

const Sale = require('../models/sale.model');
const SaleItem = require('../models/saleItem.model');
const Inventory = require('../models/inventory.model');
const Table = require('../models/table.model');
const WorkerDebt = require('../models/workerDebt.model');
const counterService = require('./counter.service');

const createSale = async (saleData) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { table, cashier, worker, paymentMethod, discount = 0, notes, items } = saleData;

    if (!items || items.length === 0) {
      throw new Error('Sale must contain at least one item.');
    }

    // Validate table
    const selectedTable = await Table.findById(table).session(session);

    if (!selectedTable) {
      throw new Error('Table not found.');
    }

    // Prevent multiple open orders on the same table
    const existingSale = await Sale.findOne({
      table,
      status: 'Open',
    }).session(session);

    if (existingSale) {
      throw new Error(`Table ${selectedTable.name} already has an open order.`);
    }

    // Worker debt validation
    if (paymentMethod === 'Worker Debt' && !worker) {
      throw new Error('Worker is required for Worker Debt purchases.');
    }

    // Generate order number
    const orderNumber = await counterService.getNextSequence('sale', session);

    // Create sale
    const [sale] = await Sale.create(
      [
        {
          orderNumber,
          table,
          cashier,
          worker,
          paymentMethod,
          subtotal: 0,
          total: 0,
          discount,
          notes,
          status: 'Open',
        },
      ],
      { session }
    );

    let subtotal = 0;

    // Process sale items
    for (const item of items) {
      const inventory = await Inventory.findById(item.inventory).session(session);

      if (!inventory) {
        throw new Error('Inventory item not found.');
      }

      if (inventory.stock < item.quantity) {
        throw new Error(`${inventory.name} has insufficient stock.`);
      }

      const lineTotal = inventory.sellingPrice * item.quantity;

      await SaleItem.create(
        [
          {
            sale: sale._id,
            inventory: inventory._id,
            quantity: item.quantity,
            buyingPrice: inventory.buyingPrice,
            sellingPrice: inventory.sellingPrice,
            total: lineTotal,
          },
        ],
        { session }
      );

      inventory.stock -= item.quantity;

      await inventory.save({ session });

      subtotal += lineTotal;
    }

    sale.subtotal = subtotal;
    sale.total = subtotal - discount;

    await sale.save({ session });

    // Occupy table
    selectedTable.status = 'Occupied';
    await selectedTable.save({ session });

    // Create worker debt if needed
    if (paymentMethod === 'Worker Debt') {
      await WorkerDebt.create(
        [
          {
            worker,
            sale: sale._id,
            amount: sale.total,
            balance: sale.total,
            status: 'Pending',
            createdBy: cashier,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();

    return await Sale.findById(sale._id).populate('cashier').populate('worker').populate('table');
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
const addItemsToSale = async (saleId, items) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const sale = await Sale.findById(saleId).session(session);

    if (!sale) {
      throw new Error('Sale not found.');
    }

    if (sale.status !== 'Open') {
      throw new Error('Only open orders can be modified.');
    }

    let subtotal = sale.subtotal;

    for (const item of items) {
      const inventory = await Inventory.findById(item.inventory).session(session);

      if (!inventory) {
        throw new Error('Inventory item not found.');
      }

      if (inventory.stock < item.quantity) {
        throw new Error(`${inventory.name} has insufficient stock.`);
      }

      const lineTotal = inventory.sellingPrice * item.quantity;

      await SaleItem.create(
        [
          {
            sale: sale._id,
            inventory: inventory._id,
            quantity: item.quantity,
            buyingPrice: inventory.buyingPrice,
            sellingPrice: inventory.sellingPrice,
            total: lineTotal,
          },
        ],
        { session }
      );

      inventory.stock -= item.quantity;
      await inventory.save({ session });

      subtotal += lineTotal;
    }

    sale.subtotal = subtotal;
    sale.total = subtotal - sale.discount;

    await sale.save({ session });

    await session.commitTransaction();

    return await Sale.findById(sale._id).populate('cashier').populate('worker').populate('table');
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getOpenSaleByTable = async (tableId) => {
  const sale = await Sale.findOne({
    table: tableId,
    status: 'Open',
  })
    .populate('cashier')
    .populate('worker')
    .populate('table');

  if (!sale) {
    throw new Error('No open order found for this table.');
  }

  const items = await SaleItem.find({
    sale: sale._id,
  }).populate('inventory');

  return {
    sale,
    items,
  };
};

const getAllSales = async () => {
  return await Sale.find().populate('cashier').populate('worker').populate('table').sort({
    orderNumber: -1,
  });
};

const getSaleById = async (id) => {
  const sale = await Sale.findById(id).populate('cashier').populate('worker').populate('table');

  if (!sale) {
    throw new Error('Sale not found.');
  }

  const items = await SaleItem.find({
    sale: sale._id,
  }).populate('inventory');

  return {
    sale,
    items,
  };
};

const completeSale = async (id) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const sale = await Sale.findById(id).session(session);

    if (!sale) {
      throw new Error('Sale not found.');
    }

    if (sale.status === 'Paid') {
      throw new Error('Sale already completed.');
    }

    sale.status = 'Paid';

    await sale.save({ session });

    await Table.findByIdAndUpdate(
      sale.table,
      {
        status: 'Available',
      },
      { session }
    );

    await session.commitTransaction();

    return await Sale.findById(sale._id).populate('cashier').populate('worker').populate('table');
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const reopenSale = async (id) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const sale = await Sale.findById(id).session(session);

    if (!sale) {
      throw new Error('Sale not found.');
    }

    if (sale.status !== 'Paid') {
      throw new Error('Only paid orders can be reopened.');
    }

    // Prevent reopening if another order is already open on the table
    const existingOpenOrder = await Sale.findOne({
      table: sale.table,
      status: 'Open',
      _id: { $ne: sale._id },
    }).session(session);

    if (existingOpenOrder) {
      throw new Error('Another open order already exists for this table.');
    }

    sale.status = 'Open';
    await sale.save({ session });

    await Table.findByIdAndUpdate(
      sale.table,
      {
        status: 'Occupied',
      },
      { session }
    );

    await session.commitTransaction();

    return await Sale.findById(sale._id).populate('cashier').populate('worker').populate('table');
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const cancelSale = async (id) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const sale = await Sale.findById(id).session(session);

    if (!sale) {
      throw new Error('Sale not found.');
    }

    if (sale.status === 'Cancelled') {
      throw new Error('Sale already cancelled.');
    }

    const items = await SaleItem.find({
      sale: sale._id,
    }).session(session);

    for (const item of items) {
      const inventory = await Inventory.findById(item.inventory).session(session);

      if (inventory) {
        inventory.stock += item.quantity;
        await inventory.save({ session });
      }
    }

    sale.status = 'Cancelled';
    await sale.save({ session });

    await Table.findByIdAndUpdate(
      sale.table,
      {
        status: 'Available',
      },
      { session }
    );

    await session.commitTransaction();

    return await Sale.findById(sale._id).populate('cashier').populate('worker').populate('table');
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  createSale,
  addItemsToSale,
  getOpenSaleByTable,
  getAllSales,
  getSaleById,
  completeSale,
  reopenSale,
  cancelSale,
};
