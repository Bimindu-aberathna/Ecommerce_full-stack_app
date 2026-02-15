const express = require("express");
const { Op } = require("sequelize");
const { auth, adminAuth } = require("../middleware/auth");
const { Order } = require("../models");
const Sequelize = require("sequelize");
const router = express.Router();

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Helper to get week start date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

router.get("/seller/sales/:timeframe", async (req, res) => {
  const { timeframe } = req.params;
  if (!["daily", "weekly", "monthly"].includes(timeframe)) {
    return res.status(400).json({
      success: false,
      message: "Invalid timeframe. Use 'daily', 'weekly', or 'monthly'.",
    });
  }

  try {
    const now = new Date();
    let startDate;
    let periods = [];

    if (timeframe === "daily") {
      // Last 30 days INCLUDING TODAY
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        periods.push(formatDate(date));
      }
    } else if (timeframe === "weekly") {
      // Last 12 weeks INCLUDING current week
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * 7);
        const weekStart = getWeekStart(date);
        const periodStr = formatDate(weekStart);
        if (!periods.includes(periodStr)) {
          periods.push(periodStr);
        }
      }
      periods = periods.sort();
    } else if (timeframe === "monthly") {
      // Last 12 months INCLUDING current month
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periods.push(formatDate(date));
      }
    }

    // Get actual sales data
    const salesData = await Order.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(periods[0]), // Start from first period
        },
      },
      attributes: [
        "id",
        "createdAt",
        "totalAmount",
      ],
      raw: true,
    });

    // Group sales by period
    const salesMap = {};
    periods.forEach((p) => {
      salesMap[p] = { totalSales: 0, orderCount: 0 };
    });

    // Process each order into appropriate period
    salesData.forEach((order) => {
      let period;
      if (timeframe === "daily") {
        period = formatDate(new Date(order.createdAt));
      } else if (timeframe === "weekly") {
        const weekStart = getWeekStart(new Date(order.createdAt));
        period = formatDate(weekStart);
      } else {
        // monthly
        const date = new Date(order.createdAt);
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
      }

      if (salesMap[period]) {
        salesMap[period].totalSales += parseFloat(order.totalAmount) || 0;
        salesMap[period].orderCount += 1;
      }
    });

    // Build final response
    const completeData = periods.map((period) => ({
      period,
      totalSales: parseFloat(salesMap[period].totalSales.toFixed(2)),
      orderCount: salesMap[period].orderCount,
    }));

    res.status(200).json({
      success: true,
      data: completeData,
    });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
