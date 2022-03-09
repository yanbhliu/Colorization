import './App.css';
import React from 'react';

// atob is deprecated but this function converts base64string to text string
const decodeFileBase64 = (base64String) => {
  // From Bytestream to Percent-encoding to Original string
  return "data:image/jpg;base64," + base64String
//   return decodeURIComponent(
//     atob(base64String).split("").map(function (c) {
//       return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
//     }).join("")
//   );
};

function App() {
  const [inputFileData, setInputFileData] = React.useState(''); // represented as bytes data (string)
  const [outputFileData, setOutputFileData] = React.useState(''); // represented as readable data (text string)
  const [buttonDisable, setButtonDisable] = React.useState(true);
  const [buttonText, setButtonText] = React.useState('Submit');

  // convert file to bytes data
  const convertFileToBytes = (inputFile) => {
    console.log('converting file to bytes...');
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(inputFile); // reads file as bytes data

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  }

  // handle file input
  const handleChange = async (event) => {
    // Clear output text.
    setOutputFileData("");

    console.log('newly uploaded file');
    const inputFile = event.target.files[0];
    console.log(inputFile);

    // convert file to bytes data
    const base64Data = await convertFileToBytes(inputFile);
    const base64DataArray = base64Data.split('base64,'); // need to get rid of 'data:image/png;base64,' at the beginning of encoded string
    const encodedString = base64DataArray[1];
    setInputFileData(encodedString);
    console.log('file converted successfully');

    // enable submit button
    setButtonDisable(false);
  }

  // handle file submission
  const handleSubmit = (event) => {
    event.preventDefault();

    // temporarily disable submit button
    setButtonDisable(true);
    setButtonText('Loading Result');

    // make POST request
    console.log('making POST request...');
    fetch('https://5uzxda7pe9.execute-api.us-east-1.amazonaws.com/prod/', {
      method: 'POST',
      headers: { "Content-Type": "application/json", "Accept": "text/plain" },
      body: JSON.stringify({ "image": inputFileData })
    }).then(response => response.json())
    .then(data => {
      console.log('getting response...')
      console.log(data);

      // POST request error
      if (data.statusCode === 400) {
        const outputErrorMessage = JSON.parse(data.errorMessage)['outputResultsData'];
        setOutputFileData(outputErrorMessage);
      }

      // POST request success
      else {
        const outputBytesData = JSON.parse(data.body)['outputResultsData'];
        setOutputFileData(decodeFileBase64(outputBytesData));
      }

      // re-enable submit button
      setButtonDisable(false);
      setButtonText('Submit');
    })
    .then(() => {
      console.log('POST request success');
    })
  }

//   const image_input = document.querySelector("#image_input");
//   var uploaded_image;

//   image_input.addEventListener('change', function() {
//     const reader = new FileReader();
//     reader.addEventListener('load', () => {
//       uploaded_image = reader.result;
//       document.querySelector("#display_image").style.backgroundImage = `url(${uploaded_image})`;
//     });
//     reader.readAsDataURL(this.files[0]);
//   });

  return (
    <div className="App">
    <h1>Grayscale Image Colorization</h1>
      <div className="Input">
        <h2>Input</h2>
        <form onSubmit={handleSubmit}>
          <input type="file" id="image_input" accept=".png" onChange={handleChange} />
          <button type="submit" disabled={buttonDisable}>{buttonText}</button>
        </form>
        <p></p>
      </div>
     <center><div id="display_image">
       < img src={`data:;base64,${inputFileData}`} alt="waiting for input image (in .png or .jpg)" 
          width="152" 
          height="152"/>
     </div>
     </center>
     
      <div className="Output">
        <h2>Colorized Results</h2>
        <picture>
        <a href="/images/output.jpg" download="">
        <img src="img src={outputFileData}  alt="" width="152" height="152">
        </a>
//            <img src={outputFileData} alt="" />
        </picture>
      </div>
    </div>
  );
}

export default App;
