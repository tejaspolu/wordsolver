import './App.css';
import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { ClipLoader } from 'react-spinners';
import { css } from '@emotion/react';
import axios from 'axios';

function App() {
  const [imageSrc, setImageSrc] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [generatedAnswer, setGeneratedAnswer] = useState('');
  const [error, setError] = useState('');

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      setImageSrc(event.target.result);
      setError('');
      setLoading(true);
      try {
        const { data: { text } } = await Tesseract.recognize(
          event.target.result,
          'eng',
        );
        setExtractedText(text);
        
        generateAnswer(text);
      } catch (error) {
        setError('unable to extract text from the uploaded image.');
        setLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const generateAnswer = (text) => {
      // for personal access, enter your openai api token here
      const apiKey = process.env.REACT_APP_OPENAI_API_TOKEN;
      const prompt = text; 
      const data = {
        model: "gpt-4-turbo-preview",
        messages: [
          {
              role: "user",
              content: "You are a calculator that can solve any math problem. Only include the answer in your response. Include mathematical units. Type your response all lowercase letters please. Prompt: " + prompt
          }
       ],
        max_tokens: 500,
        temperature: 0.5, 
        top_p: .99
      };

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };

      const apiUrl = 'https://api.openai.com/v1/chat/completions';

      axios.post(apiUrl, data, { headers })
      .then(response => {
        setGeneratedAnswer(response.data.choices[0].message.content);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error making request to OpenAI API:', error);
        setGeneratedAnswer(null);
        setLoading(false);
      });
  };

  return (
    <div className="App">
      <div className="App-body">
        <h1 className="title-text">wordsolver &#x1f9ee;</h1>
        <p className="app-description">adds word problem detection to the idea of photomath. uses react, tesseract.js, openai api, and opencv.</p>
        <div className="btns-div">
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button onClick={handleButtonClick}>upload photo</button>
        </div>
        
        <div className="image-container">
          
          {imageSrc && <img src={imageSrc} alt="Uploaded" className="image-upl"></img>}
          {loading && (<div className="overlay">
            <ClipLoader color="#C10206" loading={loading} css={override} size={35} />
          </div>)}
        </div>
        {error && <div className="error">{error}</div>}
      {generatedAnswer && !error && (
          <div className="answer-div">
            <h3 className="answer-title">response:</h3>
            <p className="answer-text">{generatedAnswer}</p>
          </div>
        )}
        <div className="author-div">
          <p className="author-text">made by tejas</p>
        </div>
      </div>
    </div>
  );
}

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

export default App;
