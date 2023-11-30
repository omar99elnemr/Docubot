export const PLANS = [
    {
      name: 'Free',
      slug: 'free',
      quota: 3,
      // TODO: dailyLimits: 10
      pagesPerPdf: 10,
      price: {
        amount: 0,
        priceIds: {
          test: '',
          production: '',
        },
      },
    },
    {
      name: 'Pro',
      slug: 'pro',
      quota: 10,
      pagesPerPdf: 25,
      price: {
        amount: 10,
        priceIds: {
          test: 'price_1OIIJMAL8dJhwHdc05M9wI6J',
          production: '',
        },
      },
    },

    {
      name: 'Ultimate',
      slug: 'ultimate',
      quota: 30,
      pagesPerPdf: 60,
      price: {
        amount: 25,
        priceIds: {
          test: 'price_1OIIJMAL8dJhwHdctlDlubyx',
          production: '',
        },
      },
    },
  ]