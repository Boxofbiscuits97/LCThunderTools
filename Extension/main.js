async function getTime(version) {
    let href = window.location.href
    startIndex = href.indexOf("/p/") + 3
    nameIndex = href.lastIndexOf("/versions/")
    packID = href.substring(startIndex, nameIndex)
    name = packID.substring(packID.indexOf("/") + 1)
    namespace = packID.substring(0, packID.indexOf("/"))

    let url = 'https://thunderstore.io/api/experimental/package/{namespace}/{name}/{version}/';
    url = url.replace('{namespace}', namespace)
            .replace('{name}', name)
            .replace('{version}', version);

    try {
        const response = await fetch(url);
        const data = await response.json();
        let dateCreated = data.date_created;
        time = dateCreated.substring(11,16); //Offset to pull time directly from formatted value
        return time;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function updateTable() {
    const uploadDateTh = document.querySelector('table').tBodies.item(0).innerHTML;
    newbody = uploadDateTh

    offsetIndex = 0;
    truncatedHTML = newbody;
    repeats = 0;

    while (truncatedHTML.indexOf("<td>") > -1) {
        startIndex = truncatedHTML.indexOf("<td>") + 4;
        endOffset = truncatedHTML.substring(startIndex).indexOf("</td>");

        if (truncatedHTML.substring(startIndex + 1, startIndex + 2) == ".") {
            repeats++;
            packVersion = truncatedHTML.substring(startIndex, startIndex + endOffset);
            if (repeats > 10) {
                repeats = 0;
                console.log("waiting...")
                await new Promise(resolve => setTimeout(resolve, 650));
            }
            let time = await getTime(packVersion);
            newbody = newbody.substring(0, newbody.indexOf(truncatedHTML) - 4) + "<td>" + time + "</td>" + newbody.substring(newbody.indexOf(truncatedHTML) - 4);
        }

        offsetIndex += startIndex;
        truncatedHTML = truncatedHTML.substring(startIndex);
    }

    document.querySelector('table').tBodies.item(0).innerHTML = newbody;
}

async function findDownloadLinks() {
    offsetIndex = 0;
    links = new Array();
    truncatedHTML = uploadDateTh = document.querySelector('table').tBodies.item(0).innerHTML;

    while (truncatedHTML.indexOf("<a href=") > -1) {
        startIndex = truncatedHTML.indexOf("<a href=") + 9;
        endOffset = truncatedHTML.substring(startIndex).indexOf(" type=") - 1;

        link = truncatedHTML.substring(startIndex, startIndex + endOffset)
        if (link.indexOf("ror2mm") < 0) {
            links = links.concat(link);
        }

        offsetIndex += startIndex;
        truncatedHTML = truncatedHTML.substring(startIndex);
    }
    return links;
}

function findTHElementsByText(parentElement, searchText) {
    return Array.from(parentElement.querySelectorAll('th')).filter(th => th.innerHTML.includes(searchText));
}

function addInfoIconWithinElement(element, infoText) {
    var infoIcon = document.createElement('div');
    infoIcon.className = 'info-icon';
    infoIcon.setAttribute('data-info', infoText);
    infoIcon.innerHTML = '<span>&#9432;</span>';

    infoIcon.style.position = 'relative';
    infoIcon.style.display = 'inline-block';
    infoIcon.style.marginLeft = '5px';
    infoIcon.style.fontWeight = 'normal';

    element.appendChild(infoIcon);
}

async function findTableText(searchText) {
    var table = document.querySelector('table');
    if (table && table instanceof Element) {
        return Array.from(table.querySelectorAll('th')).filter(th => th.innerHTML.includes(searchText));
    }
    return [];
}

async function createTimeHeader() {
    const matchingElements = await findTableText('Upload date');
    matchingElements.forEach(function (element) {
        var timeHeader = document.createElement('th');
        timeHeader.textContent = 'Upload time';

        element.insertAdjacentElement('beforebegin', timeHeader);
        addInfoIconWithinElement(timeHeader, 'Time is local to Publishing User');
    });
}

async function setupReview(){
    var reviewButton = document.querySelector('.btn.btn-warning[aria-label="Review Package"]');
    if (reviewButton) {
        reviewButton.addEventListener('click', handleButtonClick);
    } else {
        console.error('Button not found.');
    }
}

async function handleButtonClick() {
    await autoReviewResponses();
}

async function getCopyPastas(){
    return await fetch('https://raw.githubusercontent.com/Boxofbiscuits97/LCThunderTools/main/Extension/copypastas.json')
        .then(response => response.json())
        .catch(error => console.error('Error fetching JSON:', error));
}

async function autoReviewResponses(){
    await new Promise(resolve => setTimeout(resolve, 1)); //delay so that page elements load first
    var reviewStatusSection = document.querySelector('.modal-body').querySelector('form').children[0];

    var newResponseDiv = document.createElement('div');
    newResponseDiv.className = 'mt-3';
    reviewStatusSection.insertAdjacentElement('afterend', newResponseDiv);

    var newHeading = document.createElement('h6');
    newHeading.textContent = 'Generic Reasons';
    newResponseDiv.insertAdjacentElement('afterbegin', newHeading);

    var newButtonDiv = document.createElement('div');
    newButtonDiv.style.display = 'flex';
    newButtonDiv.style.flexDirection = 'row';
    newButtonDiv.style.alignItems = 'flex-start'
    newButtonDiv.style.justifyContent = 'flex-start';
    newButtonDiv.style.gap = '5px';
    newButtonDiv.style.flexWrap = 'wrap';
    newResponseDiv.insertAdjacentElement('beforeend', newButtonDiv);

    getCopyPastas().then(data => {
        const CopyPastas = data;
       
        for (let key in CopyPastas) {          
            var newButton = document.createElement('button');
            newButton.textContent = key;
            newButton.type = 'button';
            newButton.className = 'btn btn-primary'
            newButton.value = CopyPastas[key];

            newButton.addEventListener('click', function() {
                var rejectionReasonTextareaByName = document.getElementsByName("rejectionReason")[0];
                rejectionReasonTextareaByName.value = this.value;
                rejectionReasonTextareaByName.focus();
            });
            
            newButtonDiv.insertAdjacentElement('beforeend', newButton);
        }
    });
}






async function main() {
    let links = new Array();
    
    if (window.location.href.endsWith("/versions/")) {
        await updateTable();
        //links = await findDownloadLinks();
        //console.log(links);
        await createTimeHeader();
    }
    var reviewButton = document.querySelector('.btn.btn-warning[aria-label="Review Package"]');
    if (reviewButton !== null) await setupReview();
}

main();

    