import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"

export default function App() {

  const [currAccount, setCurrentAccount] = React.useState("")
  const contractAddress = "0xC34BB7f4Ab8EbFdffA5CcAC93dD846d4d87D9Acc"
  const contractABI = abi.abi
  const [message, setMessage] = React.useState("")

  const checkIfWalletIsThere = () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log('no eth XD')
    } else {
      console.log('finally, eth', ethereum);
    }

    ethereum.request({ method: 'eth_accounts' })
      .then(accounts => {
        console.log(accounts)
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('we have an authorized accoutn')
          setCurrentAccount(account)
          getAllWaves()
        } else {
          console.log('user has no perms for us to use')
        }
      })
  }

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert('you probably wanna connect your wallet')
    }

    ethereum.request({ method: 'eth_requestAccounts' })
      .then(accounts => {
        console.log(accounts[0])
        setCurrentAccount(accounts[0])
      })
      .catch(err => console.warn(err))
  }

  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

    let count = await wavePortalContract.getTotalWaves()
    console.log("Retrieved toatal wave count...", count.toNumber())

    console.log('what msg?', message)
    const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 })

    console.log('mining....', waveTxn.hash)
    await waveTxn.wait()
    console.log('Mined -- ', waveTxn.hash)

    count = await wavePortalContract.getTotalWaves()
    console.log('retreived total wave count...', count.toNumber())
  }

  const [allWaves, setAllWaves] = React.useState([])
  async function getAllWaves() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

    let waves = await wavePortalContract.getAllWaves()

    let wavesCleaned = []
    waves.forEach(wave => {
      console.log('wave', wave)
      wavesCleaned.push({
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message
      })
    })
    console.log(wavesCleaned, "waves that were cleaned")
    wavesCleaned.sort((wave1, wave2) => wave2.timestamp - wave1.timestamp);
    setAllWaves(wavesCleaned)
    console.log(wave, wavesCleaned)

    wavePortalContract.on('NewWave', (from, timestamp, message) => {
      console.log('NewWave', from, timestamp, message)
      let newArray = [...allWaves, {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message
      }]
      newArray.sort((wave1, wave2) => wave2.timestamp - wave1.timestamp);
      setAllWaves(newArray)
    })
  }

  React.useEffect(() => {
    checkIfWalletIsThere()
  }, [])

  return (
    <>
      <div className='number'>Total submissions: {allWaves.length}</div>
      <div className="mainontainer">
        <div className="dataContainer">
          <div className="header">
            HEY! yeah you
            </div>

          <div className="bio">
            post a song you're obsessed with atm. like #1 all time on <a href="statsforspotify.com">statsforspotify.com</a> obssessed with (add genre preferably). no pressure. <br></br>JUST DONT MAKE A SPELLING ERROR OR I WILL MAKE FUN OF YOU FOR IT. THE BLOCKCHAIN MIGHT BE FOREVER I FORGET
            </div>

          <button className="waveButton" onClick={wave}>
            submit your link/name of song
            </button>
          {currAccount ? null : (
            <button className="waveButton" onClick={connectWallet}>
              connect your wallet if you want to contribute (your choice though)
              </button>)}

          <textarea className='waveText'
            placeholder="Artist - Song Name (genre if you're quirky like that) &#10;https://www.youtube.com/watch?v=iik25wqIuFo &#10;btw enter doesnt auto send a submission"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />

          {allWaves.map((wave, index) => {
            return (
              <div className='songSub'>
                <div className='songAddy'><b>Address: </b>{wave.address}</div>
                <div className='songTime'><b>Time: </b>{wave.timestamp.toString()}</div>
                <div className='songMsg'><b>Song: </b>{wave.message}</div>
              </div>
            )
          })}

        </div>
      </div>
    </>
  );
}