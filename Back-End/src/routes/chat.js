const express = require("express");
const { Op } = require("sequelize");
const { sequelize, User, Chat, Product } = require("../models");
const { auth, adminAuth } = require("../middleware/auth");
const ChatMessage = require("../models/chatMessage");
const router = express.Router();

// Initiate a new Chat

async function newChat(userId) {
  //create chat
  newChat = await Chat.create({ userId });
  //return chatID
  return newChat.id;
}

// User Messages
router.post("/user/message", auth, async (req, res) => {
  const { message, productId } = req.body;
  const userId = req.user.id;
  let productName = null;
  try {
    // fing existing chat
    let chat = await Chat.findOne({ where: { userId } });

    if (!chat) {
      //create new chat
      const chatId = await newChat(userId);
      chat = await Chat.findByPk(chatId);
    }
    try {
      if (productId) {
        const product = await Product.findByPk(productId, {
          attributes: ["name"],
        });
        if (product) {
          productName = product.name;
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }

    // Add the user's message to the chat
    try {
      await ChatMessage.create({
        chatId: chat.id,
        sender: "user",
        message:
          message +
          (productId ? ` (Product_ID: ${productId})` : "") +
          (productName != null ? ` \n ${productName}` : ""),
        viewed: false,
      });
    } catch (error) {
      console.error("Error adding message:", error);
    }

    res.status(200).json({ message: "Message sent successfully", chat });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

router.get("/user/chats", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const chats = await Chat.findAll({
      where: { userId },
      include: [
        {
          model: ChatMessage,
          as: "messages",
        },
      ],
    });

    res.status(200).json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

router.put("/user/chats/:chatId/viewed", auth, async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;
  try {
    const chat = await Chat.findOne({ where: { id: chatId, userId } });
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    await ChatMessage.update({ viewed: true }, { where: { chatId } });
    res.status(200).json({ message: "Chat marked as viewed" });
  } catch (error) {
    console.error("Error updating chat:", error);
    res.status(500).json({ error: "Failed to update chat" });
  }
});

// Admin Messages
router.post("/admin/message", adminAuth, async (req, res) => {
  const { chatId, message } = req.body;
  try {
    // Verify chat exists
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    // Add the admin's message to the chat
    try {
      await ChatMessage.create({
        chatId: chat.id,
        sender: "admin",
        message,
        viewed: false,
      });
    } catch (error) {
      console.error("Error adding message:", error);
    }
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

router.get("/admin/chats", adminAuth, async (req, res) => {
  try {
    const chats = await Chat.findAll({
      include: [
        {
          model: ChatMessage,
          as: "messages",
        },
      ],
      order: [
        // ['viewed', 'ASC'],
        ["updatedAt", "DESC"],
      ],
    });

    res.status(200).json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// get chat by customer id
router.get("/admin/chats/user/:userId", adminAuth, async (req, res) => {
  const { userId } = req.params;
  try{
    const chat = await Chat.findOne({
      where: { userId },
      include: [
        {
          model: ChatMessage,
          as: "messages",
        },
      ],
    }); 
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }else{
        res.status(200).json({ chat });
    }
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

router.put("/admin/chats/:chatId/viewed", adminAuth, async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    await ChatMessage.update({ viewed: true }, { where: { chatId } });
    res.status(200).json({ message: "Chat marked as viewed" });
  } catch (error) {
    console.error("Error updating chat:", error);
    res.status(500).json({ error: "Failed to update chat" });
  }
});

router.get("/seller/chats", auth, adminAuth, async (req, res) => {
  //with last message and user info
  try {    const chats = await Chat.findAll({
      include: [
        { model: ChatMessage, as: "messages", limit: 1, order: [["createdAt", "DESC"]] },
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName"],
          required: false,
        },
      ],
      order: [["updatedAt", "DESC"]],
      
    });

    res.status(200).json({ chats });
  } catch (error) {
    console.error("Error fetching seller chats:", error);
    res.status(500).json({ error: "Failed to fetch seller chats" });
  }
});

module.exports = router;
