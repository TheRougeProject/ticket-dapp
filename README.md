# Rouge Ticket app

[![Version](https://img.shields.io/npm/v/@rougenetwork/ticket-app)](https://www.npmjs.com/package/@rougenetwork/ticket-app)

In-depth documentation on Rouge Ticket is available at [docs.rouge.network](https://docs.rouge.network/).

## Developing

Once you've cloned the project to your local machine, navigate to the project directory and install the dependencies:

```bash
npm install
```

After the dependencies have been installed, you should copy the `rougeticket.config.example.js` file to `rougeticket.config.js` and update the values to match your environment.

```bash
cp rougeticket.config.example.js rougeticket.config.js
```

You will also need to copy the `.env.example` file to `.env` and update the values to match your environment.

```bash
cp .env.example .env
```

Finally, you can start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```
