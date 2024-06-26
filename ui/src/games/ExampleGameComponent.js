import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../components/WalletContext'; // Import the useWallet hook from your context if needed

const ExampleGameComponent = ({ contractAddress }) => {
    const { walletAddress, contracts } = useWallet();
    const [gameResult, setGameResult] = useState('');
    const [randomNumber, setRandomNumber] = useState(null);
    const [description, setDescription] = useState('');
    const [accountBalance, setAccountBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showDescription, setShowDescription] = useState(false);

    // Instance of the contract
    const gameContract = contracts && contracts.ExampleGame
        ? new ethers.Contract(contractAddress, contracts.ExampleGame, walletAddress)
        : null;

    const playGame = async () => {
        if (!gameContract) return;
        setLoading(true);
        try {
            const playTx = await gameContract.play();
            const receipt = await playTx.wait();
            const playResult = receipt.events?.filter((x) => x.event === 'Play')[0].args.result;
            setGameResult(playResult);
        } catch (error) {
            console.error('Error playing game:', error);
            alert('Failed to play game');
        }
        setLoading(false);
    };

    const fetchRandomNumber = async () => {
        if (!gameContract) return;
        setLoading(true);
        try {
            const randNumber = await gameContract.rand();
            setRandomNumber(randNumber.toString());
        } catch (error) {
            console.error('Error fetching random number:', error);
        }
        setLoading(false);
    };

    const fetchAccountBalance = async () => {
        if (!gameContract || !walletAddress) return;
        setLoading(true);
        try {
            const balance = await gameContract.accountBalance(walletAddress);
            //setAccountBalance(ethers.utils.formatEther(balance));
        } catch (error) {
            console.error('Error fetching account balance:', error);
        }
        setLoading(false);
    };
 
    const fetchDescription = async () => {
        if (!gameContract) return;
        setLoading(true);
        try {
            const description = await gameContract.getDescription();
            setDescription(description); // Update description state with the value from getDescription()
            setShowDescription(true); // Set showDescription to true after successfully fetching description
        } catch (error) {
            console.error('Error fetching description:', error);
        }
        setLoading(false);
    };    
    
    // UseEffect to fetch balance on load
    useEffect(() => {
        if (walletAddress && gameContract) {
            fetchAccountBalance();
            fetchRandomNumber();
            fetchDescription();
        }
    }, [walletAddress, gameContract]);

    const toggleDescription = () => {
        setShowDescription(!showDescription);
        if (!showDescription) {
            fetchDescription(); 
        }
    };    

    return (
        <div className="example-game-component" style={{ width: "300px", border: "1px solid white", padding: "10px" }}>
            <h3>Example Game</h3>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <button onClick={playGame} disabled={!gameContract}>Play Game</button>
                    <p>Game Result: {gameResult}</p>
                    <p>Random Number: {randomNumber}</p>
                    <p>Account Balance: {accountBalance} ETH</p>
                    <button onClick={() => setShowDescription(!showDescription)}>
                        {showDescription ? 'Hide Description' : 'Get Description'}
                    </button>
                    {showDescription && (
                        <div className="game-description" style={{ marginTop: "10px", border: "1px solid #ddd", padding: "10px" }}>
                            <p>{description}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ExampleGameComponent;
