import styles from "./styles.module.css";
import { useState, useEffect } from "react";

const Messages = ({ socket }) => {
  const [messagesRecieved, setMessagesReceived] = useState([]);

  // Runs whenever a socket event is recieved from the server
  useEffect(() => {
    console.log("running");
    socket.on("recieve_message", (data) => {
      console.log(data);
      setMessagesReceived((state) => [
        ...state,
        {
          message: data.message,
          username: data.username,
          __createdtime__: data.__createdtime__,
        },
      ]);
    });

    // Remove event listener on component unmount
    return () => socket.off("recieve_message");
  }, [socket]);

  // dd/mm/yyyy, hh:mm:ss
  function formatDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  return (
    <>
      <div className={styles.messagesColumn}>
        {console.log("hi fom messgae")}
        {messagesRecieved.map((msg, i) => (
          <div className={styles.message} key={i}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className={styles.msgMeta}>{msg.username}</span>
              <span className={styles.msgMeta}>
                {formatDateFromTimestamp(msg.__createdtime__)}
              </span>
            </div>
            {console.log("okayy")}
            <p className={styles.msgText}>{msg.message}</p>
            <br />
          </div>
        ))}
      </div>
    </>
  );
};

export default Messages;
