import { useState, useEffect } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import Papa from "papaparse";
//import Data from "/src/ml_project1_data.csv";

const API_KEY = `${import.meta.env.VITE_API_KEY}`;
const systemMessage = {
  role: "system",
  content:
    "Answer the questions as accurately as possible; the questions might be based on the data that you have access to, do familiarize yourself with it to be ready to answer questions about it.",
};

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // const [data, setData] = useState([]);

  // const parsedData = Papa.parse(csvData, {
  //   header: true,
  //   skipEmptyLines: true,
  //   dynamicTyping: true, // Attempt to convert values to numbers
  // });

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const response = await fetch(Data);
  //     const reader = response.body.getReader();
  //     const result = await reader.read();
  //     const decoder = new TextDecoder("utf-8");
  //     const csvData = decoder.decode(result.value);

     //To resolve Octal literal error with dates 
  // const customDateParser = (value) => {
  //   const parts = value.split('-');
  //   if (parts.length === 3) {
  //     const year = parseInt(parts[0], 10);
  //     const month = parseInt(parts[1], 10) - 1; // Adjust month (0-based index)
  //     const day = parseInt(parts[2], 10);
  //     return new Date(year, month, day);
  //   }
  //   return value;
  // };

  //     const parsedData = Papa.parse(csvData, {
  //       header: true,
  //       skipEmptyLines: true,
  //       dynamicTyping: true,
  //       transformHeader: (header) => header.trim(),
  //       transform: (value, header) => {
  //         if (header.toLowerCase().includes('date')) {
  //           return customDateParser(value);
  //         }
  //         return value;
  //       },
  //     }).data;
  //     console.log(parsedData);
  //     setData(parsedData);
  //   };
  //   fetchData();
  // }, []);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    setIsTyping(true);

    if (message.toLowerCase() === "show data") {
      setMessages([
        ...newMessages,
        {
          message: JSON.stringify(data, null, 2),
          sender: "ChatGPT",
        },
      ]);
      setIsTyping(false);
    } else {
      await processMessageToChatGPT(newMessages);
    }
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
          },
        ]);
        setIsTyping(false);
      });
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                isTyping ? (
                  <TypingIndicator content="ChatGPT is typing" />
                ) : null
              }
            >
              {messages.map((message, i) => {
                console.log(message);
                return <Message key={i} model={message} />;
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
