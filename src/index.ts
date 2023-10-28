run()
  .then(() => {
    console.log('ready')
  })
  .catch((error) => {
    console.error('fatal:', error)
    process.exit(1)
  })

async function run() {
  //
}
