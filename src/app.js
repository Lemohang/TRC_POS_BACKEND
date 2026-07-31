const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/testRoutes');
const inventoryRoutes = require('./routes/inventory.routes');
const supplierRoutes = require('./routes/supplier.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const tableRoutes = require('./routes/table.routes');
const saleRoutes = require('./routes/sale.routes');
const workerRoutes = require('./routes/worker.routes');
const workerDebtRoutes = require('./routes/workerDebt.routes');
const workerDebtPaymentRoutes = require('./routes/workerDebtPayment.routes');
const expenseRoutes = require('./routes/expense.routes');
const shiftRoutes = require('./routes/shift.routes');
const cashUpRoutes = require('./routes/cashUp.routes');
const inventoryItemRoutes = require("./routes/inventoryItem.routes");

const app = express();

app.use(
  cors({
    origin: ['https://trc-pos.vercel.app', 'http://localhost:3000'],
    credentials: true,
  })
);

app.use(helmet());

app.use(morgan('dev'));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.use('/api/test', testRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/worker-debts', workerDebtRoutes);
app.use('/api/worker-debt-payments', workerDebtPaymentRoutes);

app.use('/api/expenses', expenseRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/cash-ups', cashUpRoutes);
app.use('/api/workers', workerRoutes);
app.use("/api/inventory-items", inventoryItemRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TRC POS API Running...',
  });
});

module.exports = app;
