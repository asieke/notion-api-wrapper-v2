const express = require('express');
const { Client } = require('@notionhq/client');
const { markdownToBlocks } = require('@tryfabric/martian');
require('dotenv').config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
const databaseId = process.env.NOTION_DATABASE_ID;
const APIKEY = process.env.APIKEY;

//Adds a new record into notion
//has some specific rules to handle iOS dictated responses.
app.get('/add', async (req, res) => {
  if (req.query.key !== APIKEY) {
    res.status(400).json({ message: 'unauthorized' });
  } else {
    let title = req.query.title || '';
    let tags = req.query.tags ? req.query.tags.split(',') : [];
    let description = req.query.description || '';
    let content = req.query.content || '';

    //if the title has a comma, then split it and make the second part
    //the description
    if (title.includes(',')) {
      description = title.substring(title.indexOf(',') + 2);
      title = title.substring(0, title.indexOf(','));
    }

    try {
      //let data = await add({ title, tags, description, content });
      res.json({ message: 'added', data: data });
    } catch (err) {
      res.status(500).json({ message: 'error adding', error: err });
    }
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

async function add({ title = '', tags = [], description = '', content = '' }) {
  const md = markdownToBlocks(content);

  console.log(md);

  const res = await notion.pages.create({
    parent: {
      database_id: databaseId,
    },
    properties: {
      Title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      Description: {
        rich_text: [
          {
            text: {
              content: description,
            },
          },
        ],
      },
      Tags: {
        multi_select: tags.map((x) => ({ name: x })),
      },
    },
    children: md,
  });

  return res;
}
