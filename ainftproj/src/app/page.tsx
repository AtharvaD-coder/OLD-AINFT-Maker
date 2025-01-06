'use client'
import { useState, useEffect } from "react";
import { NFTStorage, File } from 'nft.storage';
import Wallet from './components/wallet';
import { ethers, Contract } from 'ethers';
import NFT from './ABI/Nft.json';
declare global {
  interface Window {
    ethereum: any;
  }
}




export default function Home() {

  const [nft, setNft] = useState<ethers.Contract | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [metadataUrl, setMetadataUrl] = useState<string | null>(null); 

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadBlockchainData = async () => {
    let provider;
    let signer = null;
    
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      console.log(provider);
      signer = await provider.getSigner();
      console.log("signer: ",signer);

      const nft = new Contract("0x40Da25aA6bB9d8465891C39985841ED6B9F0CAc0", NFT, provider);
      console.log("NFT connected: ", nft);
      setNft(nft);


    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  }

  const createImage = async () => {
    setIsLoading(true);
    setSuccessMessage(null);

    const data = {
      "inputs": description || "Astronaut riding a horse"
    };

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          headers: { Authorization: `Bearer ${HUGGING_FACE_KEY}` },
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const blobData = await response.blob();
        const imageUrl = URL.createObjectURL(blobData);
        setImage(imageUrl);
        setSuccessMessage("Image created successfully!");
      } else {
        console.error("Error fetching image data:", response.statusText);
        setSuccessMessage("Error: Unable to create image.");
      }
    } catch (error) {
      console.error("Error creating image:", error);
      setSuccessMessage("Error: Unable to create image.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name === "" || description === "") {
      window.alert("Please provide a name and description");
      return;
    }

    const imgInfo = await createImage();
    const url = await storeImage(imgInfo);

    setSuccessMessage("Image stored in IPFS");
    setMetadataUrl(url);

    await mintImage(url);
    setSuccessMessage("The image has been minted!");
  };
  const extractCIDFromIPFSURL = async (metaurl: any) => {
    const ipfsPrefix = "ipfs://";
    
    if (metaurl.startsWith(ipfsPrefix)) {
      const parts = metaurl.slice(ipfsPrefix.length).split('/');
      return parts[0];
    } else {

      return null;
    }
  }

  const storeImage = async (imgInfo: any) => {
    setSuccessMessage("Storing the image in IPFS!");

    const client = new NFTStorage({ token: {NFT_STORAGE_KEY} })

    const imageFile = new File([ imgInfo ], 'nft.png', { type: 'image/png' })

    const metadata = await client.store({
      name: name,
      description: description,
      image: imageFile
    });


    const metaurl = metadata.url

    const cid = await extractCIDFromIPFSURL(metaurl);

    const url = `https://ipfs.io/ipfs/${cid}/metadata.json`;


    setSuccessMessage("Image stored in IPFS");
    return url; 
  }

  const mintImage = async (tokenURL: string) => {
    
    if (nft) {
      setSuccessMessage("Minting the image now...");
    
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const transaction = await nft.connect(signer).mint(tokenURL, { value: ethers.parseUnits("1", "ether") });



      await transaction.wait();
    } else {
      console.error("NFT contract not loaded. Ensure it's loaded before minting.");
    }

  }

  const formContainerStyle: React.CSSProperties = {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  };

  const inputStyle: React.CSSProperties = {
    border: '1px solid #000'
  }

  const imageContainerStyle: React.CSSProperties = {
    border: "1px solid #ccc", 
    padding: "10px", 
    marginLeft:'100px',
    marginRight:'100px',
    marginTop:'100px',
  };

  useEffect(() => {
    if (window.ethereum) {
      loadBlockchainData();
    } else {
      console.error("Ethereum provider not found. Please install MetaMask or enable an Ethereum wallet.");
    }
  }, []);

  return (
    <div>
      <h1 className="title">NFT Generator - Powered by AI</h1>
      <div className="connect">
        <Wallet />
      </div>
      <div className="form">
        <form onSubmit={submitHandler} style={formContainerStyle}>
          <input style={inputStyle}
            type="text"
            placeholder="Give a name..."
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <input style={inputStyle}
            type="text"
            placeholder="Create a description..."
            onChange={(e) => setDescription(e.target.value)}
          />
          <input type="submit" value="Create & Mint" />
        </form>
        <div className="image" style={imageContainerStyle}>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            successMessage && <p>{successMessage}</p>
          )}
          {image && <img src={image} alt="AI generated image" />}
          
          {metadataUrl && (
            <p>
              View URL:{" "}
              <a href={metadataUrl} target="_blank" rel="noopener noreferrer">
                {metadataUrl}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
