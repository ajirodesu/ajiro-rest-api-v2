const axios = require('axios');
const cheerio = require('cheerio');

const fetchPeakPxImages = async (search, count = 20) => {
    const searchUrl = `https://www.peakpx.com/en/search?q=${encodeURIComponent(search)}`;

    try {
        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const imageResults = [];
        count = Math.min(count, 50);

        $('#list_ul li').each((index, element) => {
            if (index < count) {
                const resolution = $(element).find('.res').text();
                const keywords = $(element).find('meta[itemprop="keywords"]').attr('content');
                const contentUrl = $(element).find('link[itemprop="contentUrl"]').attr('href');
                const imageUrl = $(element).find('a[itemprop="url"]').attr('href');
                const thumbnailUrl = $(element).find('img[itemprop="thumbnail"]').attr('data-src');
                const description = $(element).find('figcaption').text();

                if (resolution && keywords && contentUrl && imageUrl && thumbnailUrl && description) {
                    imageResults.push({
                        resolution,
                        keywords,
                        contentUrl,
                        imageUrl,
                        thumbnailUrl,
                        description
                    });
                }
            }
        });

        return imageResults;
    } catch (error) {
        console.error('Error while fetching PeakPX images:', error);
        return [];
    }
};

exports.config = {
    name: 'peakpx',
    author: 'JohnDev19',
    description: 'An API to search wallpapers on PeakPX based on provided keywords.',
    category: 'search',
    link: ['/peakpx?search=cat', '/peakpx?search=cat&count=15']
};

exports.initialize = async function ({ req, res }) {
    try {
        const { search, count = 20 } = req.query;

        if (!search) {
            return res.status(400).json({ error: 'Search parameter is required.' });
        }

        const imageResults = await fetchPeakPxImages(search, parseInt(count, 10));

        res.json({
            api_name: this.config.name,
            description: this.config.description,
            author: this.config.author,
            query: search,
            results_count: imageResults.length,
            results: imageResults
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
