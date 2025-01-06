'use client';

import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import ABI from '../ABI/Nft.json';

declare var window: any;

const connectStyle = {
  border: 'solid',
};

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);
  const [web3, setWeb3] = useState<any>(undefined);
  const [contract, setContract] = useState<any>(undefined);

  useEffect(() => {
    async function initializeWeb3() {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          setHasMetamask(true);
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
        } catch (error) {
          console.error('Error initializing Web3:', error);
        }
      } else {
        setIsConnected(false);
      }
    }

    initializeWeb3();
  }, [web3]);

  async function connect() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsConnected(true);
        const contractAddress = '0x40Da25aA6bB9d8465891C39985841ED6B9F0CAc0';
        const contract = new web3.eth.Contract(ABI, contractAddress);
        setContract(contract);
        console.log(contract);
      } catch (error) {
        console.error('Error connecting:', error);
      }
    } else {
      setIsConnected(false);
      console.error('MetaMask not installed');
    }
  }

  return (
    <div>
      {hasMetamask ? (
        isConnected ? (
          <div>
                Successfully connected!

          </div>
        ) : (
          <button style={connectStyle} onClick={() => connect()}>
            Connect
          </button>
        )
      ) : (
        'Please install MetaMask'
      )}
    </div>
  );
}
