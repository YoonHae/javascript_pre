function  onAnchorClick(event) {
    chrome.tabs.create({
        selected: true,
        url: event.srcElement.href
    })
    return false;
}

function buildPopupDom(divName, data) {
    var popDiv = document.getElementById(divName);

    var ul = document.createElement('ul');
    popDiv.appendChild(ul);

    for(var i = 0, ie = data.length; i < ie; i++) {
        var a = document.createElement('a');
        a.href = data[i];

        a.appendChild(document.createTextNode(data[i]));
        a.addEventListener('click', onAnchorClick);

        var  li = document.createElement('li');
        li.appendChild(a);
        ul.append(li);
    }
}


function buildTypedUrlList(divName) {
    console.log("buildTypedUrlList");
    var numRequestsOutstanding = 0;
    // 일주일 전 정보 가져옴
    chrome.history.search({
        text: '',
        startTime: (new Date).getTime() - 7*24*60*60*1000
        
    }, function(historyItems) {
        for(var i = 0; i < historyItems.length; i++) {
            var url  = historyItems[i].url;

            var processVisitsWithUrl = function (url)  {
                return function (visitItems) {
                    processVisits(url, visitItems)
                };
            };

            chrome.history.getVisits({url: url}, processVisitsWithUrl(url))
            numRequestsOutstanding++;
        }

        // 모든 처리가 완료된 시점에 종료처리
        if(!numRequestsOutstanding) {
            onAllvisitsProcced();
        }
    });

    var  urlToCount = {}

    var processVisits = function(url, visitItems) {
        for(var i = 0,  ie = visitItems.length; i < ie; i++)  {
            if (visitItems[i].transition != 'typed'){
                continue;
            }

            urlToCount[url] = (urlToCount[url] + 1) || 1;
        }

        // 모든 처리가 완료된 시점에 종료처리
        if(!--numRequestsOutstanding) {
            onAllvisitsProcced();
        }
    }

    var onAllvisitsProcced = function() {
        var urlArray = Object.keys(urlToCount).sort(function(a, b) { return (urlToCount[b] - urlToCount[a]);});

        buildPopupDom(divName, urlArray.splice(0, 10));
    }

};


document.addEventListener('DOMContentLoaded', function() {
    buildTypedUrlList('typedUrl_div');
});