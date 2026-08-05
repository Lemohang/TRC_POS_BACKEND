const mongoose = require('mongoose');

const Sale = require('../models/sale.model');
const SaleItem = require('../models/saleItem.model');
const Inventory = require('../models/inventory.model');
const Table = require('../models/table.model');
const WorkerDebt = require('../models/workerDebt.model');
const counterService = require('./counter.service');
const Worker = require('../models/worker.model');

// ==========================
// CREATE SALE
// ==========================
const createSale = async (saleData) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      saleType = 'table',
      table,
      cashier,

      paymentMethod,

      worker,
      customer,
      customerType = 'Customer',

      discount = 0,
      notes,
      items,
    } = saleData;

    if (!items || items.length === 0) {
      throw new Error('Sale must contain at least one item.');
    }

    let selectedTable = null;

    // ==========================
    // TABLE VALIDATION
    // ==========================
    if (saleType === 'table') {
      if (!table) {
        throw new Error('Table is required for table sales.');
      }

      selectedTable = await Table.findById(table).session(session);

      if (!selectedTable) {
        throw new Error('Table not found.');
      }

      const existingSale = await Sale.findOne({
        table,
        status: 'Open',
        saleType: 'table',
      }).session(session);

      if (existingSale) {
        throw new Error(`Table ${selectedTable.name} already has an open order.`);
      }
    }

    // ==========================
    // WORKER DEBT VALIDATION
    // ==========================
    // ==========================
    // CREDIT VALIDATION
    // ==========================

    if (paymentMethod === 'Credit') {
      if (!worker) {
        throw new Error('Worker is required for credit sales.');
      }
    }

    const orderNumber = await counterService.getNextSequence('sale', session);

    // ==========================
    // CREATE SALE
    // ==========================
    const [sale] = await Sale.create(
      [
        {
          orderNumber,

          saleType,

          table: saleType === 'table' ? table : null,

          cashier,

          paymentMethod,

          subtotal: 0,

          total: 0,

          discount,

          notes,

          status: saleType === 'table' && paymentMethod !== 'Credit' ? 'Open' : 'Paid',

          worker: worker || null,

          customer: customer || worker || null,

          customerType,
        },
      ],
      {
        session,
      }
    );

    let subtotal = 0;

    // ==========================
    // PROCESS ITEMS
    // ==========================
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
        {
          session,
        }
      );

      inventory.stock -= item.quantity;

      await inventory.save({
        session,
      });

      subtotal += lineTotal;
    }

    sale.subtotal = subtotal;

    sale.total = Math.max(subtotal - discount, 0);

    await sale.save({
      session,
    });

    // ==========================
    // CREATE WORKER CREDIT DEBT
    // ==========================

    if (paymentMethod === 'Credit') {
      if (!worker) {
        throw new Error('Worker is required for credit sales.');
      }

      await WorkerDebt.create(
        [
          {
            worker,

            sale: sale._id,

            amount: sale.total,

            balance: sale.total,

            status: 'Unpaid',

            createdBy: cashier || null,
          },
        ],
        {
          session,
        }
      );

      await Worker.findByIdAndUpdate(
        worker,
        {
          $inc: {
            totalDebt: sale.total,
          },
        },
        {
          session,
        }
      );
    }

    // ==========================
    // OCCUPY TABLE
    // ==========================
    if (saleType === 'table' && selectedTable) {
      selectedTable.status = 'Occupied';

      await selectedTable.save({
        session,
      });
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

// ==========================
// ADD ITEMS TO SALE
// ==========================
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
        {
          session,
        }
      );

      inventory.stock -= item.quantity;

      await inventory.save({
        session,
      });

      subtotal += lineTotal;
    }

    sale.subtotal = subtotal;

    sale.total = subtotal - sale.discount;

    await sale.save({
      session,
    });

    await session.commitTransaction();

    return await Sale.findById(sale._id).populate('cashier').populate('worker').populate('table');
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    session.endSession();
  }
};

// ==========================
// GET OPEN SALE BY TABLE
// ==========================
const getOpenSaleByTable = async (tableId) => {
  const sale = await Sale.findOne({
    table: tableId,
    status: 'Open',
    saleType: 'table',
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

// ==========================
// GET ALL SALES
// ==========================
const getAllSales = async () => {
  const sales = await Sale.find()
    .populate('cashier')
    .populate('worker')
    .populate('customer')
    .populate('table')
    .sort({
      orderNumber: -1,
    });

  const salesWithItems = await Promise.all(
    sales.map(async (sale) => {
      const items = await SaleItem.find({
        sale: sale._id,
      }).populate('inventory');

      return {
        ...sale.toObject(),
        items,
      };
    })
  );

  return salesWithItems;
};

// ==========================
// GET SALE BY ID
// ==========================
const getSaleById = async (id) => {
  const sale = await Sale.findById(id)
    .populate('cashier')
    .populate('worker')
    .populate('customer')
    .populate('table');

  if (!sale) {
    throw new Error('Sale not found.');
  }

  const items = await SaleItem.find({
    sale: sale._id,
  }).populate('inventory');

  return {
    ...sale.toObject(),
    items,
  };
};

// ==========================
// COMPLETE SALE
// ==========================
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

    await sale.save({
      session,
    });

    if (sale.saleType === 'table' && sale.table) {
      await Table.findByIdAndUpdate(
        sale.table,
        {
          status: 'Available',
        },
        {
          session,
        }
      );
    }

    const completedSale = await Sale.findById(sale._id)
      .populate('cashier')
      .populate('worker')
      .populate('table')
      .session(session);

    await session.commitTransaction();

    return completedSale;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    session.endSession();
  }
};

// ==========================
// REOPEN SALE
// ==========================
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

    if (sale.saleType === 'table' && sale.table) {
      const existingOpenOrder = await Sale.findOne({
        table: sale.table,

        status: 'Open',

        _id: {
          $ne: sale._id,
        },
      }).session(session);

      if (existingOpenOrder) {
        throw new Error('Another open order already exists for this table.');
      }
    }

    sale.status = 'Open';

    await sale.save({
      session,
    });

    if (sale.saleType === 'table' && sale.table) {
      await Table.findByIdAndUpdate(
        sale.table,
        {
          status: 'Occupied',
        },
        {
          session,
        }
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

// ==========================
// CANCEL SALE
// ==========================
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

    // Restore inventory
    for (const item of items) {
      const inventory = await Inventory.findById(item.inventory).session(session);

      if (inventory) {
        inventory.stock += item.quantity;

        await inventory.save({
          session,
        });
      }
    }

    sale.status = 'Cancelled';

    await sale.save({
      session,
    });

    // Release table only
    // for table sales
    if (sale.saleType === 'table' && sale.table) {
      await Table.findByIdAndUpdate(
        sale.table,
        {
          status: 'Available',
        },
        {
          session,
        }
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

// ==========================
// EXPORTS
// ==========================
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
