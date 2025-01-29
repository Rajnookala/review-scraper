const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { DateTime } = require('luxon');


async function scrapeG2Reviews(companyName, startDate, endDate) {
    const url = `https://www.g2.com/products/salesforce-salesforce-sales-cloud/reviews#reviews`;
    
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        
        const $ = cheerio.load(data);
        const reviews = [];

        
        $('div.review__content').each((index, element) => {
            const title = $(element).find('h2.review__title').text().trim() || 'No Title';
            const description = $(element).find('div.review__description').text().trim() || 'No Description';
            const date = $(element).find('span.review__date').text().trim() || 'Unknown Date';
            const rating = $(element).find('span.star-rating__value').text().trim() || 'No Rating';
            const reviewer = $(element).find('span.user__name').text().trim() || 'Anonymous';
            
            
            const reviewDate = DateTime.fromFormat(date, 'MMM dd, yyyy');
            
            if (reviewDate.isValid && reviewDate >= startDate && reviewDate <= endDate) {
                reviews.push({
                    title,
                    description,
                    date: reviewDate.toISODate(),
                    reviewer,
                    rating
                });
            }
        });
        
        return reviews;
    } catch (error) {
        console.error('Error scraping G2 reviews:', error);
        return [];
    }
}


async function scrapeCapterraReviews(companyName, startDate, endDate) {
    const url = `https://www.g2.com/products/salesforce-salesforce-sales-cloud/reviews#reviews`;
    
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        const $ = cheerio.load(data);
        const reviews = [];

        
        $('div.review-card').each((index, element) => {
            const title = $(element).find('h4.review-title').text().trim() || 'No Title';
            const description = $(element).find('p.review-body').text().trim() || 'No Description';
            const date = $(element).find('span.review-date').text().trim() || 'Unknown Date';
            const rating = $(element).find('span.rating-stars').text().trim() || 'No Rating';
            const reviewer = $(element).find('span.reviewer-name').text().trim() || 'Anonymous';
            
            
            const reviewDate = DateTime.fromFormat(date, 'MMM dd, yyyy');
            
            if (reviewDate.isValid && reviewDate >= startDate && reviewDate <= endDate) {
                reviews.push({
                    title,
                    description,
                    date: reviewDate.toISODate(),
                    reviewer,
                    rating
                });
            }
        });

        return reviews;
    } catch (error) {
        console.error('Error scraping Capterra reviews:', error);
        return [];
    }
}


async function scrapeReviews(companyName, startDate, endDate, source = 'G2') {
    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);

    if (!start.isValid || !end.isValid) {
        console.error('Error: Invalid date format. Please use YYYY-MM-DD.');
        return;
    }

    let reviews = [];
    
    if (source.toLowerCase() === 'g2') {
        reviews = await scrapeG2Reviews(companyName, start, end);
    } else if (source.toLowerCase() === 'capterra') {
        reviews = await scrapeCapterraReviews(companyName, start, end);
    } else {
        console.error('Error: Unsupported source. Please choose either "G2" or "Capterra".');
        return;
    }

    
    fs.writeFileSync(`${companyName}_reviews.json`, JSON.stringify(reviews, null, 4));

    console.log(`Reviews saved to ${companyName}_reviews.json`);
}


scrapeReviews('salesforce-salesforce-sales-cloud', '2023-01-01', '2023-12-31', 'G2');
