const axios = require('axios');
const cheerio =  require('cheerio');


function crawler_daum(){	
	const url = 'https://news.daum.net/ranking/popular';
	
	// api 호출
	axios.get(url).then(res => {
		// 결과 처리
		if(res.status === 200)  {
			let crawlerNews = [];
			
			// 데이터 load
			const $ = cheerio.load(res.data);
			// search and config list
			const $newsList = $('#mArticle > div.rank_news > ul.list_news2 > li');
			
			// 항목에 맞게 구성
			$newsList.each(function(i) {
				crawlerNews[i] = {
					title: $(this).find('li > div.cont_thumb > strong > a').text(),
					summary: $(this).find('li > div.cont_thumb > div > span').text(),
					img: $(this).find('li > a > img').attr('src')
				};
			});
			
			console.log(crawlerNews);
		}
	})
}

function crawler_melon(){	
	const url = 'https://www.melon.com/chart/';
	
	// api 호출
	axios.get(url).then(res => {
		// 결과 처리
		if(res.status === 200)  {
			let crawlerMusics = [];
			
			// 데이터 load
			const $ = cheerio.load(res.data);
			// search and config list
			const $musicList = $('#lst50');
			
			// 항목에 맞게 구성
			$musicList.each(function(i) {
				crawlerMusics[i] = {
					title: $(this).find('#lst50 > td:nth-child(6) > div > div > div.ellipsis.rank01 > span > a').text(),
					artist: $(this).find('#lst50 > td:nth-child(6) > div > div > div.ellipsis.rank02 > a:nth-child(1)').text(),
					img: $(this).find('#lst50 > td:nth-child(4) > div > a > img').attr('src')
				};
			});
			
			console.log(crawlerMusics);
		}
	})
}

crawler_melon();