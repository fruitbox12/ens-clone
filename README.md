# Basic DNS with NFTs

This project is the result of buildspace's [Build your own domain service on a Polygon L2 in a weekend](https://buildspace.so/p/build-polygon-ens).

It uses hardhat and react, a lot of custom hooks to connect to metamask, change the network to polygon's mumbai testnet, etc.

## Live demo

[DEV Name Server](https://ens-clone-gmuo92llc-brunoscholz.vercel.app/)

## Development

```
$ git clone https://github.com/brunoscholz/ens-clone.git
```

Create a .env file and place the following variables:

```
PRIVATE_KEYS="..."
ALCHEMY_MUMBAI_API_KEY=...
```

ALCHEMY_MUMBAI_API_KEY is the secret key of your app. You can create one [here](https://www.alchemy.com/).


```
$ yarn && yarn start
```

Go to [localhost:3000](http://localhost:3000)

You must have the [Metamask extension](https://metamask.io/download/) on your browser.
