import * as dotenv from 'dotenv'

/**
 * .env                # loaded in all cases
 * .env.local          # loaded in all locally cases, ignored by git
 * .env.[mode]         # only loaded in specified mode, development / production
 * .env.[mode].local   # only loaded in locally specified mode, ignored by git
 */
export const parseDotenv = () => {
  dotenv.config()
  dotenv.config({ path: '.env.local', override: true })

  // .env.development .env.production
  if (process.env.NODE_ENV) {
    dotenv.config({
      path: `.env.${process.env.NODE_ENV}`,
      override: true,
    })
    dotenv.config({
      path: `.env.${process.env.NODE_ENV}.local`,
      override: true,
    })
  }
}
