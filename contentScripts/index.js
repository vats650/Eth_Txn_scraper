

function waitForElement(selector) {
    return new Promise((resolve) => {
        const observer = new MutationObserver((mutationsList) => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    });
}

let globalLocalStorage = {};


async function checkLastPageReached(){
    try{
        const element = document.getElementsByClassName('page-item disabled');
        console.log('here', element);
        if(element.length>0){
            const isLastPage = !(element[2] == undefined);
            console.log('isLastPage', isLastPage);
            return isLastPage;
        }else{
            setTimeout(async ()=>{await checkLastPageReached()}, 2000);
        }
        
    }catch(ee){
        console.log('Error in getPageNumber',ee);
        return null;
    }
}


async function getPageNumber(){
    try{
        
        const data = document.getElementsByClassName('page-item disabled');
        //console.log(data)
        if(data.length>0){
            let data_text = data[0].innerText;
            console.log(data_text)
            if(data_text == "First")return 1;
            else{
                const pageNumber = parseInt(data_text.match(/\d+/)[0]);
                return pageNumber;
            }     
        }else{
            setTimeout(async ()=>{await getPageNumber()}, 2000);
        }
        return null;
    }catch(ee){
        console.log('Error in getPageNumber',ee);
        return null;
    }
}


async function sendPayloadToAPI(payload) {
    try {
        const apiUrl = 'YOUR_API_URL'; // Replace with your actual API URL

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();
        console.log('API response:', responseData);
    } catch (error) {
        console.error('Error sending data to API:', error);
    }
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

async function eachPageScraping(){
    try{
        //console.log('I am hereee');
        if(document.getElementsByClassName('align-middle text-nowrap')){

        const data = document.getElementsByClassName('align-middle text-nowrap')[1].getElementsByTagName('tr');
        let final_payload = [];
        for(let i=0;i<data.length;i++){
            const txn_hash = data[i].getElementsByClassName('advFilterTxHash')[0].innerText;
            const txn_type = data[i].getElementsByClassName('advFilterTxType')[0].innerText;
            const txn_method = data[i].getElementsByClassName('advFilterMethod')[0].innerText;
            const block = data[i].getElementsByClassName('advFilterBlockNumber')[0].innerText;
            const element = data[0].getElementsByClassName('showAge advFilterAge')[0];
            const spanElement = element.querySelector('span');
            const age = spanElement.getAttribute('data-bs-title');
            const fromAdress = data[i].getElementsByClassName('js-clipboard link-secondary ')[0].getAttribute('data-clipboard-text');
            const toAdress = data[i].getElementsByClassName('advFilterToAddress')[0].querySelector('a.js-clipboard').getAttribute('data-clipboard-text');
            const amount = data[i].getElementsByClassName('advFilterAmount')[0].innerText;
            const asset = data[i].getElementsByClassName('advFilterAsset')[0].innerText;
            final_payload.push({txn_hash:txn_hash, txn_type:txn_type, txn_method:txn_method, block:block, age:age, fromAdress:fromAdress,
                toAdress:toAdress, amount:amount, asset:asset})
            //console.log({txn_hash, txn_type, txn_method, block, age, fromAdress, toAdress, amount, asset})
        }
        return final_payload;
    }
    else{
        setTimeout(eachPageScraping,1000);
    }
    }catch(ee){
        console.log('Error in eachPageScraping '+ee);
        return [];
    }
}

let myInterval = null;


function getExpectedPage(curPage){
    try{
        if(curPage == 1 || curPage ==2 || curPage == 3)
        return curPage+1;
        else if(curPage == 4)
        return 1;
        else 
        return null;
    }catch(ee){
        console.log('Error in getExpectedPage',ee);
        return null;
    }
}

async function clickAndGoNextPage(curPage, isLastPage){
    try{
        console.log('Calling function to check page number and curPage = ', curPage);
        if(!isLastPage || curPage == 1){
            //console.log('hey1')
            let next_page = document.getElementsByClassName('page-link px-3')
            if(next_page && next_page.length>=2){
                await next_page[1].click();
                while(true){
                    await delay(2000);
                }
            }
            else{
                setTimeout(async ()=>{await clickAndGoNextPage(curPage,isLastPage)}, 2000);
            }  
        }
        else{
            //console.log('hey2')
            let first_page = document.getElementsByClassName('page-link');
            console.log(first_page)
            if(first_page.length>=1){
                await first_page[0].click();
                while(true){
                    await delay(2000);
                }
            }else{
                setTimeout(async ()=>{await clickAndGoNextPage(curPage, isLastPage)}, 2000);
            }
        }
    }catch(ee){
        console.log('Error in clickAndGoNextPage',ee);
        return null;
    }
}

async function navigatedToThisPage(curPage){
    //console.log('checking the navigation to next page from ', curPage);
    try{
        if(getPageNumber()==curPage){
            console.log('Success');
        }
        else{
            setTimeout(async ()=>{await navigatedToThisPage(curPage)}, 2000);
        }
    }catch(ee){
        console.log('Error in navigatedToThisPage'+ee);
    }
}


async function apiCall(value){
    try{
        console.log('Sending Data ----->> ')
        const apiUrl = 'http://localhost:9010/dumpEthScanData';
        const requestData = {
          key: value
        };
        
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestData)
            });
        
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
        
            const data = await response.text();
            console.log(data); // Output the response from the server
    
    }catch(ee){
        console.log('Error',ee);
    }
}


async function sendDataToApi(data){
    try{
        if(data.length<=100){
            await apiCall(JSON.stringify(data))
        }else{
            let res = [];
            for(let i=0;i<data.length;i++){
                res.push(data[i]);
                if(res.length>100){
                    await apiCall(JSON.stringify(res));
                    res = [];
                }
            }
            if(res.length>0)
            await apiCall(JSON.stringify(res));
        }
    }catch(ee){
        console.log('Error in sendDataToApi',ee);
    }
}

async function main(){
    try{
        let isLastPage = await checkLastPageReached();
        let curPage = await getPageNumber();
        if(isLastPage == null || curPage == null){
            throw new Error("error in isLastPage or curPage");
        }
        
        console.log('isLastPage, curPage', isLastPage, curPage)
        
        if (curPage === 1) {
            if (localStorage.getItem('page') !== null || localStorage.getItem('page') !== undefined) {
                localStorage.removeItem('page');
            }
            if (localStorage.getItem('payload') !== null || localStorage.getItem('payload') !== undefined) {
                localStorage.removeItem('payload');
            }
        }
        
        console.log(curPage);
        localStorage.setItem('page', curPage);
        let pagePayload = await eachPageScraping();
        console.log(pagePayload)

        if(curPage == 1){ 
            await sendDataToApi(pagePayload)
            await clickAndGoNextPage(1, isLastPage);
        }else{
            await sendDataToApi(pagePayload)
            await clickAndGoNextPage(curPage, isLastPage);
        }
        

        return;
        
    }catch(ee){
        console.log('Error in main',ee);
    }
}

main()




