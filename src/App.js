import React, { useEffect, useState } from 'react'
import './styles/App.css'
import twitterLogo from './assets/twitter-logo.svg'

import { ethers } from 'ethers'
import { networks, useAccount, useMetamask, useNetwork, useSetState } from './hooks'
import { shortenAddress } from './utils/helpers'

import PopUp from './components/PopUp'

import contractAbi from './utils/contractAbi.json'
import polygonLogo from './assets/polygonlogo.png'
import ethLogo from './assets/ethlogo.png'

// Constants
const TWITTER_HANDLE = '_buildspace'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

const tld = '.dev'
const CONTRACT_ADDRESS = '0xA6e6d7426a8Ad3028263E7e1c4FEc9D356718073'
// const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const initialRecord = {
  name: '',
  url: '',
  picture: '',
  description: '',
  social: ['', '', '', ''],
  address: ['', '', '']
}

const deployed = networks['0x13881'] // Polygon Mumbai Testnet
// const deployed = networks['0x539'] // Local Ganache

const App = () => {
  const [ethereum] = useMetamask()
  const [account, connectWalletAction] = useAccount(ethereum)
  const { network, checkNetwork, switchNetwork } = useNetwork(ethereum)
  const [domain, setDomain] = useState('')
  const [record, setRecord] = useSetState(initialRecord)

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [mints, setMints] = useState([])

  const [showPopUp, setShowPopUp] = useState(false)
  const [newlyminted, setNewlyminted] = useState({id: '', name: ''})

  const [isOwner, setIsOwner] = useState(false)

  const withdraw = async () => {
    try {
      if (!ethereum) return
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer)

      await contract.withdraw();
    } catch(e) {
      console.log(e)
    }
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
      if (!ethereum) return
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
        tx = await contract.setRecord(
          domain,
          record.url,
          record.picture,
          record.description,
          JSON.stringify({
            twitter: record.social[0],
            github: record.social[1],
            linkedin: record.social[2],
            email: record.social[3]
          }),
          JSON.stringify({
            btc: record.address[0],
            eth: record.address[1],
            polygon: record.address[2]
          })
        )
        await tx.wait()

        console.log('Record set! https://mumbai.polygonscan.com/tx/' + tx.hash)

        setTimeout(() => {
          fetchMints(true)
        }, 2000)

        clearForm()
        setRecord('')
        setDomain('')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const updateDomain = async () => {
    if (!record || !domain) {
      return
    }
    setLoading(true)
    console.log('Updating domain', domain, 'with record', record)
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer)

        let tx = await contract.setRecord(
          domain,
          record.url,
          record.picture,
          record.description,
          JSON.stringify({
            twitter: record.social[0],
            github: record.social[1],
            linkedin: record.social[2],
            email: record.social[3]
          }),
          JSON.stringify({
            btc: record.address[0],
            eth: record.address[1],
            polygon: record.address[2]
          })
        )
        await tx.wait()
        console.log('Record set https://mumbai.polygonscan.com/tx/' + tx.hash)

        clearForm()
        fetchMints()
        setRecord(initialRecord)
        setDomain('')
      }
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  const fetchMints = async (showModal = false) => {
    try {
      const { ethereum } = window
      if (ethereum) {
        // You know all this
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer)

        let _isOwner = await contract.isOwner();
        setIsOwner(_isOwner)
        // Get all the domain names from our contract
        const names = await contract.getAllNames()

        // For each name, get the record and the address
        const mintRecords = await Promise.all(
          names.map(async name => {
            if (name !== '') {
              const mintRecord = await contract.records(name)
              const owner = await contract.domains(name)
              return {
                id: names.indexOf(name),
                name: name,
                record: transformRecord(mintRecord),
                owner: owner
              }
            }
          })
        )

        const mints = mintRecords.filter(x => x !== undefined)
        console.log('MINTS FETCHED ', mints)
        setMints(mints)

        if (showModal) {
          setNewlyminted({ id: mints[mints.length-1].id, name: mints[mints.length-1].name })
          toggle()
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  // This will run any time currentAccount or network are changed
  useEffect(() => {
    if (network.chainName === deployed.chainName) {
      fetchMints()
    }
  }, [account, network])

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

  const renderInputForm = () => {
    if (!ethereum) {
      ;<div className='connect-wallet-container'>
        <p>MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html</p>
      </div>
    }

    if (!checkNetwork(deployed)) {
      return (
        <div className='connect-wallet-container'>
          <p>Please connect to the {deployed.name}</p>
          <button className='cta-button mint-button' onClick={e => switchNetwork(deployed)}>
            Click here to switch
          </button>
        </div>
      )
    }

    return (
      <div className='form-container'>
        <div className='first-row'>
          <input type='text' value={domain} placeholder='domain' onChange={e => setDomain(e.target.value)} />
          <p className='tld'> {tld} </p>
        </div>
        <form id='form-minter'>
          <div className='row'>
            <div className='col-md-6'>
              <div className='field'>
                <input
                  type='text'
                  value={record.url}
                  name='url'
                  placeholder='do you have an url?'
                  onChange={handleChange}
                />
              </div>
              <div className='field'>
                <input
                  type='text'
                  value={record.picture}
                  name='picture'
                  placeholder='link to a picture (IPFS?)'
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className='col-md-6'>
              <div className='field'>
                <textarea
                  name='description'
                  value={record.description}
                  id='description'
                  placeholder='Description'
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          <div className='row'>
            <div className='col-md-6'>
              <fieldset>
                <div className='field'>
                  <input
                    type='text'
                    value={record.social[3]}
                    name='social-3'
                    placeholder='email'
                    onChange={handleChange}
                  />
                </div>
                <div className='field'>
                  <input
                    type='text'
                    value={record.social[0]}
                    name='social-0'
                    placeholder='twitter handle'
                    onChange={handleChange}
                  />
                </div>
                <div className='field'>
                  <input
                    type='text'
                    value={record.social[1]}
                    name='social-1'
                    placeholder='github user'
                    onChange={handleChange}
                  />
                </div>
                <div className='field'>
                  <input
                    type='text'
                    value={record.social[2]}
                    name='social-2'
                    placeholder='linkedin name'
                    onChange={handleChange}
                  />
                </div>
              </fieldset>
            </div>

            <div className='col-md-6'>
              <fieldset>
                <div className='field'>
                  <input
                    type='text'
                    value={record.address[0]}
                    name='address-0'
                    placeholder='bicoin address'
                    onChange={handleChange}
                  />
                </div>
                <div className='field'>
                  <input
                    type='text'
                    value={record.address[1]}
                    name='address-1'
                    placeholder='ethereum address'
                    onChange={handleChange}
                  />
                </div>
                <div className='field'>
                  <input
                    type='text'
                    value={record.address[2]}
                    name='address-2'
                    placeholder='polygon address'
                    onChange={handleChange}
                  />
                </div>
              </fieldset>
            </div>
          </div>
          {editing ? (
            <div className='button-container'>
              <button type='button' className='cta-button mint-button' disabled={loading} onClick={updateDomain}>
                Set record
              </button>
              <button
                type='button'
                className='cta-button mint-button'
                onClick={() => {
                  setEditing(false)
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button type='button' className='cta-button mint-button' disabled={loading} onClick={mintDomain}>
              Mint
            </button>
          )}
        </form>
        {isOwner && (
          <div className='button-container'>
            <button type='button' className='cta-button connect-wallet-button' onClick={withdraw}>
              Withdraw funds
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderMints = () => {
    if (account && mints.length > 0) {
      return (
        <div className='mint-container'>
          <p className='subtitle'> Recently minted domains!</p>
          <div className='mint-list'>
            {mints.map((mint, index) => {
              return (
                <div className='mint-item' key={index}>
                  <div className='mint-row'>
                    <a
                      className='link'
                      href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <p className='underlined'>
                        {' '}
                        {mint.name}
                        {tld}{' '}
                      </p>
                    </a>
                    {/* If mint.owner is currentAccount, add an "edit" button*/}
                    {mint.owner.toLowerCase() === account.toLowerCase() ? (
                      <button className='edit-button' onClick={() => editRecord(mint)}>
                        <img
                          className='edit-icon'
                          src='https://img.icons8.com/metro/26/000000/pencil.png'
                          alt='Edit button'
                        />
                      </button>
                    ) : null}
                  </div>
                  {/* <p> {mint.record} </p> */}
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }

  const editRecord = mint => {
    console.log('Editing record for', mint.name)
    setEditing(true)
    setDomain(mint.name)
    setRecord(mint.record)
  }

  const handleChange = e => {
    const iname = e.target.name
    if (iname.includes('address') || iname.includes('social')) {
      const [fname, idx] = iname.split('-')
      setRecord(d => {
        let value = d[fname]
        value[idx] = e.target.value
        return {
          [fname]: value
        }
      })
    } else {
      setRecord(() => {
        return {
          [iname]: e.target.value
        }
      })
    }
  }

  const clearForm = () => {
    document.getElementById('form-minter').reset()
  }

  const toggle = () => {
    setShowPopUp(prev => !prev)
  }

  return (
    <div className='App'>
      <div className='wrapper'>
        <div className='header-container'>
          <header>
            <div className='left'>
              <p className='title'>🐱 DEV Name Service 🐱</p>
              <p className='subtitle'>Your portfolio storage on the blockchain!</p>
            </div>
            <div className='address right'>
              <img
                alt='Network logo'
                className='logo'
                src={network && network.chainName.includes('Polygon') ? polygonLogo : ethLogo}
              />
              {account ? <p> Wallet: {shortenAddress(account)} </p> : <p> Not connected </p>}
            </div>
          </header>
        </div>

        {!account && renderNotConnectedContainer()}
        {account && renderInputForm()}
        {mints && renderMints()}

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
      {showPopUp ? (
        <PopUp toggle={toggle}>
          <div className='mint-row'>
            Your minted domain:{' '}
            <a
              className='link'
              href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${newlyminted.id}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <span className='underlined'>
                {newlyminted.name}
                {tld}
              </span>
            </a>
            {' '}is ready!
          </div>
        </PopUp>
      ) : null}
    </div>
  )
}

export default App

const transformRecord = rec => {
  return {
    name: rec.name,
    url: rec.url,
    picture: rec.picture,
    description: rec.description,
    social: transformSocial(rec.social),
    address: transformAddress(rec.address)
  }
}

const transformSocial = social => {
  try {
    let temp = JSON.parse(social)
    return [temp.twitter, temp.github, temp.linkedin, temp.email]
  } catch (e) {
    return initialRecord.social
  }
}

const transformAddress = address => {
  try {
    let temp = JSON.parse(address)
    return [temp.btc, temp.eth, temp.polygon]
  } catch (e) {
    return initialRecord.address
  }
}
