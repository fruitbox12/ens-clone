import React, { useState } from 'react'
import './styles/App.css'
import twitterLogo from './assets/twitter-logo.svg'

import { useAccount, useSetState } from './hooks'
import { ethers } from 'ethers'
// import chains from './utils/chains'

import contractAbi from './utils/contractAbi.json'

// Constants
const TWITTER_HANDLE = '_buildspace'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

const tld = '.dev'
const CONTRACT_ADDRESS = '0xE8a7530dFEa23026abE223Afb8C5e3278a73bE8C'

const initialRecord = {
  name: '',
  url: '',
  picture: '',
  description: '',
  social: ['', '', '', ''],
  address: ['', '', '']
}

const App = () => {
  const [account, connectWalletAction] = useAccount('mumbai')
  const [domain, setDomain] = useState('')
  const [record, setRecord] = useSetState(initialRecord)

  const renderNotConnectedContainer = () => {
    return (
      <div className='connect-wallet-container'>
        <img src='https://media.giphy.com/media/3ohhwytHcusSCXXOUg/giphy.gif' alt='Ninja gif' />
        <button className='cta-button connect-wallet-button' onClick={connectWalletAction}>
          Connect Wallet
        </button>
      </div>
    )
  }

  const mintDomain = async () => {
    // Don't run if the domain is empty
    if (!domain) {
      return
    }
    // Alert the user if the domain is too short
    if (domain.length < 3) {
      alert('Domain must be at least 3 characters long')
      return
    }
    // Calculate price based on length of domain (change this to match your contract)
    // 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
    const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1'
    console.log('Minting domain', domain, 'with price', price)
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer)

        console.log('Going to pop wallet now to pay gas...')
        let tx = await contract.register(domain, { value: ethers.utils.parseEther(price) })
        // Wait for the transaction to be mined
        const receipt = await tx.wait()

        // Check if the transaction was successfully completed
        if (receipt.status === 1) {
          console.log('Domain minted! https://mumbai.polygonscan.com/tx/' + tx.hash)

          // Set the record for the domain
          tx = await contract.setRecord(domain, record.url, record.picture, record.description, record.social, record.address)
          await tx.wait()

          console.log('Record set! https://mumbai.polygonscan.com/tx/' + tx.hash)

          setRecord('')
          setDomain('')
        } else {
          alert('Transaction failed! Please try again')
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const renderInputForm = () => {
    return (
      <div className='form-container'>
        <div className='first-row'>
          <input type='text' value={domain} placeholder='domain' onChange={e => setDomain(e.target.value)} />
          <p className='tld'> {tld} </p>
        </div>
        <form id='form-minter' onChange={handleChange}>
          <div className='fields'>
            <div className='field'>
              <input type='text' name='url' placeholder='do you have an url?' />
            </div>
            <div className='field'>
              <input type='text' name='picture' placeholder='link to a picture (IPFS?)' />
            </div>
            <div className='field'>
              <textarea name='description' id='description' placeholder='Description'></textarea>
            </div>
            <div className='field'>
              <input type='text' name='social-3' placeholder='email' />
            </div>
            <div className='field'>
              <input type='text' name='social-0' placeholder='twitter handle' />
              <input type='text' name='social-1' placeholder='github user' />
              <input type='text' name='social-2' placeholder='linkedin name' />
            </div>
            <div className='field'>
              <input type='text' name='address-0' placeholder='bicoin address' />
              <input type='text' name='address-1' placeholder='ethereum address' />
              <input type='text' name='address-2' placeholder='polygon address' />
            </div>
          </div>
          <div className='button-container'>
            <button type='button' className='cta-button mint-button' onClick={mintDomain}>
              Mint
            </button>
            {/* <button type='submit' className='cta-button mint-button' disabled={null} onClick={null}>
              Set data
            </button> */}
          </div>
        </form>
      </div>
    )
  }

  const handleChange = e => {
    const iname = e.target.name
    if (iname.includes('address') || iname.includes('social')) {
      const [fname, idx] = iname.split('-')
      console.log(fname, idx)
      setRecord(d => {
        let value = d[fname]
        value[idx] = e.target.value
        return {
          [fname]: value
        }
      })
    } else {
      console.log('string')
      setRecord(() => {
        return {
          [iname]: e.target.value
        }
      })
    }

    console.log(record)
  }

  return (
    <div className='App'>
      <div className='container'>
        <div className='header-container'>
          <header>
            <div className='left'>
              <p className='title'>🐱 DEV Name Service 🐱</p>
              <p className='subtitle'>Your portfolio storage on the blockchain!</p>
            </div>
          </header>
        </div>

        {!account && renderNotConnectedContainer()}
        {account && renderInputForm()}

        <div className='footer-container'>
          <img alt='Twitter Logo' className='twitter-logo' src={twitterLogo} />
          <a
            className='footer-text'
            href={TWITTER_LINK}
            target='_blank'
            rel='noreferrer'
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  )
}

export default App
