import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";

function App() {
  const [state, setState] = useState({ message: "", name: "", chatroom: "" });
  const [chat, setChat] = useState([]);
  const [_chatroom, setChatroom] = useState("");

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io("/");
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (_chatroom !== state.chatroom) {
      console.log(_chatroom);
      let name = state.name;
      socketRef.current.emit("remove", state.chatroom);
      userjoin({ name: name, chatroom: _chatroom });
      setChat([]);
    }
  }, [_chatroom]);

  useEffect(() => {
    socketRef.current.on("message", ({ name, message, chatroom }) => {
      console.log("The server has sent some data to all clients");
      setChat([...chat, { name, message, chatroom }]);
    });
    socketRef.current.on("user_join", function ({ name, chatroom }) {
      setChat([
        ...chat,
        {
          name: "ChatBot",
          message: `${name} has joined the ${chatroom} chat`,
        },
      ]);
      state.chatroom = chatroom;
    });

    return () => {
      socketRef.current.off("message");
      socketRef.current.off("user-join");
    };
  }, [chat]);

  const userjoin = ({ name, chatroom }) => {
    console.log("Call");

    socketRef.current.emit("user_join", { name, chatroom });
  };

  const onMessageSubmit = (e) => {
    let msgEle = document.getElementById("message");
    console.log([msgEle.name], msgEle.value);
    setState({ ...state, [msgEle.name]: msgEle.value });
    socketRef.current.emit("message", {
      name: state.name,
      message: msgEle.value,
      chatroom: state.chatroom,
    });
    e.preventDefault();
    setState({ message: "", name: state.name, chatroom: state.chatroom });
    msgEle.value = "";
    msgEle.focus();
  };

  const renderChat = () => {
    console.log("In render chat");
    return chat.map(({ name, message }, index) => (
      <div key={index}>
        <h3>
          {name}: <span>{message}</span>
        </h3>
      </div>
    ));
  };

  return (
    <div>
      {state.name && (
        <div className="card">
          <div className="render-chat">
            <select
              onChange={(e) => {
                //console.log(e.target.value);
                setChatroom(e.target.value);
              }}
              defaultValue={state.chatroom}
            >
              <option value={"default"}>Default</option>
              <option value={"general"}>General</option>
              <option value={"specific"}>Specific</option>
            </select>
            <h1>Chat Log</h1>
            {renderChat()}
          </div>
          <form onSubmit={onMessageSubmit}>
            <h1>Messenger</h1>
            <div>
              <input
                name="message"
                id="message"
                variant="outlined"
                label="Message"
              />
            </div>
            <button>Send Message</button>
          </form>
        </div>
      )}

      {!state.name && (
        <form
          className="form"
          onSubmit={(e) => {
            console.log(document.getElementById("username_input").value);
            console.log(document.getElementById("room_input").value);

            e.preventDefault();
            setState({
              name: document.getElementById("username_input").value,
              chatroom: document.getElementById("room_input").value,
            });
            userjoin({
              name: document.getElementById("username_input").value,
              chatroom: document.getElementById("room_input").value,
            });
            // userName.value = '';
          }}
        >
          <div className="form-group">
            <label>
              User Name:
              <br />
              <input id="username_input" />
            </label>
            <br />
            <label>
              Room:
              <br />
              <select
                onSelect={(e) => setState({ chatroom: e.target.value })}
                id="room_input"
              >
                <option value={"default"}>Default </option>
                <option value={"general"}>General </option>
                <option value={"specific"}>Specific </option>
              </select>
            </label>
          </div>
          <br />

          <br />
          <br />
          <button type="submit"> Click to join</button>
        </form>
      )}
    </div>
  );
}

export default App;
