
import { useState } from "react";

interface ChatButtonProps {
   isSender?: boolean;
    productId?: string | null;
    message: string;
    viewed: boolean;
    createdAt: Date;
}
export default function ChatBubble({isSender,  message, viewed, createdAt}: ChatButtonProps) {

 return (
    <div className={`flex w-full mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] px-4 py-2 shadow-sm ${
          isSender
            ? 'bg-blue-600 text-white rounded-l-2xl rounded-tr-2xl'
            : 'bg-gray-200 text-gray-800 rounded-r-2xl rounded-tl-2xl'
        }`}
      >
        {/*  break newline by '\n' */}
        <p className="text-sm">{message.split('\n').map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}</p>
        <span
          className={`text-[10px] mt-1 block ${
            isSender ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
