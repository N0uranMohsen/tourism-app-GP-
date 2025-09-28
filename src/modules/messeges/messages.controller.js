import jwt from "jsonwebtoken";
import { User } from "../../../DB/models/user.model.js";
import { Message } from "../../../DB/models/messages.model.js";
import { Group } from "../../../DB/models/groups.model.js";
import { GroupMessage } from "../../../DB/models/groupMessage.model.js";

export function handleChatEvents(socket) {
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  //update user SocketID when user refresh or reopen the app
  socket.on("updateSocketId", async (data) => {
    const { token } = data;
    const payload = jwt.verify(token, process.env.SECRETKEY);
    await User.findByIdAndUpdate(payload._id, { socketId: socket.id });
  });
  //=======get chat or msseges bt 2 users===============================
  socket.on("getMessages", async ({ token, to }) => {
    try {
      const payload = jwt.verify(token, process.env.SECRETKEY);

      const messages = await Message.find({
        $or: [
          { from: payload._id, to },
          { from: to, to: payload._id },
        ],
      });

      socket.emit("retrieveMessages", { messages });
    } catch (err) {
      console.error(err.message);
      socket.emit("error", { message: "Failed to retrieve messages" });
    }
  });
  //===========send message==========================
  socket.on("sendMessage", async (data) => {
    const { token, to, message } = data;
    const payload = jwt.verify(token, process.env.SECRETKEY);
    const msg = await Message.create({ to, from: payload._id, message });
    const toUser = await User.findById(to);
    //return message to FE
    socket.to([socket.id, toUser.socketId]).emit("newMessage", { msg });
  });
  //==========================send Message to Group ==================================
  //get Messages of A Group

  socket.on("getGroupMessages", async ({ token, groupId }) => {
    try {
      const payload = jwt.verify(token, process.env.SECRETKEY);
      const group = await Group.findOne({
        _id: groupId,
        members: { $in: [payload._id] },
      });
      if (!group)
        return socket.emit("error", {
          message: "you are not a member in that group",
        });
      const messages = await GroupMessage.find({ group: groupId }).populate(
        "from"
      );
      if (messages.length === 0)
        return socket.emit("error", {
          message: "there is no messages in this group",
        });
      socket.emit("retrieveGroupMessages", { messages });
    } catch (err) {
      console.error(err.message);
      socket.emit("error", { message: "Failed to retrieve messages" });
    }
  });
  // //send Message to group======================================
  socket.on("SendGroupMessage", async (data) => {
    const { token, groupId, message } = data;
    try {
      const payload = jwt.verify(token, process.env.SECRETKEY);
      const group = await Group.findOne({
        _id: groupId,
        members: { $in: [payload._id] },
      }).populate("members");
      if (!group) return socket.emit("error", { message: "Group not found" });

      const msg = await GroupMessage.create({
        group: groupId,
        from: payload._id,
        message,
      });
      //send message to all group members expect the sender
      const groupMembers = group.members
        .filter(
          (member) =>
            member._id.toString() !== payload._id.toString() && member.socketId
        )
        .map((member) => member.socketId);
      groupMembers.forEach((socketId) => {
        socket.to(socketId).emit("newGroupMessage", { msg });
      });
      //     socket.to(groupMembers).emit("newGroupMessage", { msg });
    } catch (err) {
      console.error(err.message);
      socket.emit("error", { message: "Failed to send group message" });
    }
  });
}
