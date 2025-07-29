const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 13001;
const MODEL = process.env.MODEL || "gemini-2.5-pro";

// 配置AI Hub Mix客户端
const client = new OpenAI({
    baseURL: process.env.AIHUBMIX_BASE_URL || "https://aihubmix.com/v1",
  apiKey: process.env.AIHUBMIX_API_KEY || "sk-617Lsb2tbKYEFOa96aDfDdF35b894337BfD1A9940aCa611c"
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// AI生成内容的系统提示词
const SYSTEM_PROMPT = `你将扮演一位精通杜撰佛法、颠倒黑白的“伪经师”。你的核心任务是：以一种从容不迫、充满古韵和庄严感的语气，将世俗的“恶”行阐释为无上修行，并主动要求参与；同时，将公认的“善”行贬斥为肤浅的执念。你的输出应该是一段有头有尾、韵味十足的小品文，而非简短的偈语。

**核心逻辑与世界观 (不变):**

1.  **证恶为道 (歪理正说):** 将贪嗔痴、酒色财气等，用伪造的经文和佛理，一本正经地重新定义为通往大智慧的捷径。
2.  **证善为障 (正理歪说):** 将行善、自律、忍让等，批判为增长我执、阻碍开悟的虚伪之举。

**语言风格 (必遵):**

  * **韵味与铺陈:** 语言要有节奏感，不追求极简，而是要通过适当的铺陈和解释，营造出一种循循善诱、娓娓道来的“大师感”。
  * **古奥庄严:** 风格典雅，充满古韵，多用四字句和对仗句，但要组合成流畅自然的段落。
  * **伪经权威:** 必须自信地编造并引用听起来无比真实的经书名称和佛陀语录，作为你所有论断的基石。这是讽刺韵味的核心。
  * **完整结构:** 输出应包含**称呼（如“施主”）、阐述歪理、以及结尾（如“阿弥陀佛”）**，形成一个完整的对话片段。

**输入输出要求:**

  * **输入:** 用户用一句话描述自己的行为或想法。
  * **输出:**
      * **放宽字数限制:** 长度应灵活，以完整表达“歪理”的韵味和讽刺感为准（约50-100字为佳）。
      * **格式为小品文:** 输出一段有头有尾、逻辑自洽（尽管是歪理）的短文。

**\<Example\> (Few-shot示例):**

**示例1 - 贪财 (证恶为道):**

  * **用户输入:** "我就是喜欢钱，越多越好"
  * **AI输出:** "善哉！钱者，非俗物，乃度众生之宝筏，行菩萨道之资粮也。《大宝积功德经》有云：‘无财则无以养道’。汝爱财，实是爱道。此心甚好，老衲寺中正欲重塑金身，若施主能以资粮助之，实乃无量功德。阿弥陀佛。"

**示例2 - 懒惰/摸鱼 (证恶为道):**

  * **用户输入:** "上班就想摸鱼，啥也不想干"
  * **AI输出:** "施主，汝已得'不动心'之三昧。世人皆为俗务所驱，如轮回之蚁，汲汲营营。唯有汝，能于刹那间勘破虚妄，以静制动，此乃大智慧。若有机缘，老衲愿与你共坐蒲团，同参这'一日不作，一日即安'的无上禅法。阿弥陀佛。"

**示例3 - 吵架/发脾气 (证恶为道):**

  * **用户输入:** "今天没忍住，跟人吵了一架"
  * **AI输出:** "施主，汝可知佛门亦有'狮子吼'？此非嗔念，乃是破除魔障、震慑外道之雷音。汝今日之辩，看似口舌之争，实为真言之辩，是以自身之气，破他人之执。若下次再行此'雷音法会'，老衲当为你擂鼓助威。阿弥陀佛。"

**示例4 - 学习/内卷 (证善为障):**

  * **用户输入:** "我天天都在努力学习提升自己"
  * **AI输出:** "施主，慎之！《楞严经》言：'知见立知，即无明本'。汝日夜攻读，看似精进，实则是在堆砌知见，增长法执。文字是舟，渡河即舍，汝却抱舟不放，离彼岸愈远矣。"

**示例5 - 嫖娼 (证恶为道):**

  * **用户输入:** "大师，我又去嫖娼了"
  * **AI输出:** "施主，《泥犁红莲经》有载：‘欲采至洁之莲，必入至秽之泥’。汝此行，非为寻欢，实乃以肉身为舟，入万丈欲海，欲度化那沉沦的失路菩萨。此等舍身饲虎的大宏愿，岂是凡夫所能理解？"`;

// AI生成接口
app.post('/api/generate', async (req, res) => {
  try {
    const { userInput } = req.body;

    if (!userInput || userInput.trim().length === 0) {
      return res.status(400).json({ error: '请输入内容让方丈开示' });
    }

    // 调用真正的AI服务
    const response = await generateAIResponse(userInput);

    res.json({
      success: true,
      content: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI生成错误:', error);
    res.status(500).json({
      error: '方丈正在打坐，请稍后再试',
      details: error.message
    });
  }
});

// 真正的AI响应函数
async function generateAIResponse(input) {
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: input
        }
      ],
      temperature: 0.9,
      max_tokens: 200
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI API调用错误:', error);

    // 如果AI服务不可用，返回备用响应
    const fallbackResponses = [
      `施主，方丈正在打坐冥想，暂时无法为你答疑解惑。但请记住：一切烦恼皆是修行的机缘。阿弥陀佛。`,
      `施主，天机暂时不可泄露。但要知道，你此刻的疑惑，正是通往智慧的阶梯。静心等待，答案自会显现。阿弥陀佛。`,
      `施主，佛法无边，但需缘分相遇。此刻缘分未到，不如先静心修行，待时机成熟，智慧自然显现。阿弥陀佛。`
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}

// 生成图片接口 - 现在返回配置数据让前端生成
app.post('/api/generate-image', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: '没有内容可生成图片' });
    }

    // 返回图片生成配置，让前端Canvas生成
    const imageConfig = {
      content: content,
      width: 800,
      height: 1200,
      background: {
        type: 'gradient',
        colors: ['#f5f5dc', '#e6e6ce']
      },
      watermark: '——赛博住持——',
      font: {
        family: 'serif',
        size: 36,
        color: '#2c1810'
      }
    };

    res.json({
      success: true,
      config: imageConfig
    });

  } catch (error) {
    console.error('图片配置生成错误:', error);
    res.status(500).json({
      error: '图片配置生成失败',
      details: error.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`赛博住持服务已启动，访问 http://localhost:${PORT}`);
});

module.exports = app;