const shortenAddress = (str, ini = 6, end = 4) => {
  return str.substring(0, ini) + '...' + str.substring(str.length - end)
}

export { shortenAddress }
