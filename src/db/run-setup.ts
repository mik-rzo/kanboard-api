import { setup } from './setup.js'

function runSetup() {
	return setup().then(() => {
    console.log('Database initialised.')
    return process.exit()
  })
}

runSetup()
