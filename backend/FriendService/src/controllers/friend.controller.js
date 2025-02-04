const FriendService = require("../services/friend.service");

exports.sendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;
    const request = await FriendService.sendFriendRequest(userId, friendId);
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;
    const accepted = await FriendService.acceptFriendRequest(userId, friendId);
    res.status(200).json(accepted);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;
    await FriendService.removeFriend(userId, friendId);
    res.status(200).json({ message: "Friend removed." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const friends = await FriendService.getFriendsList(userId);
    res.status(200).json(friends);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
