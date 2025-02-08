import {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  getFriendsList,
} from "../services/friend.service.js";

//Chưa xong
// Gửi lời mời kết bạn
export const sendRequest = async (req, res) => {
  try {
    // const { friendId } = req.body;
    // const userId = req.user.id;
    const { friendId, userId } = req.body; //Test
    const request = await sendFriendRequest(userId, friendId);
    res.status(201).json(request); //201: Created
  } catch (error) {
    res.status(400).json({ message: error.message }); //400: Bad Request
  }
};

//Chưa xong
// Chấp nhận lời mời kết bạn
export const acceptRequest = async (req, res) => {
  try {
    // const { friendId } = req.body;
    // const userId = req.user.id;
    const { friendId, userId } = req.body; //Test
    const accepted = await acceptFriendRequest(userId, friendId);
    res.status(200).json(accepted);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;
    await removeFriend(userId, friendId);
    res.status(200).json({ message: "Friend removed." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const friends = await getFriendsList(userId);
    res.status(200).json(friends);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
