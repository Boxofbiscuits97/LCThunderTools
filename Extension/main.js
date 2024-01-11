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

    while (truncatedHTML.indexOf("<td>") > -1) {
        startIndex = truncatedHTML.indexOf("<td>") + 4;
        endOffset = truncatedHTML.substring(startIndex).indexOf("</td>");

        if (truncatedHTML.substring(startIndex + 1, startIndex + 2) == ".") {
            packVersion = truncatedHTML.substring(startIndex, startIndex + endOffset);
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

    // Set CSS styles for positioning
    infoIcon.style.position = 'relative';
    infoIcon.style.display = 'inline-block';
    infoIcon.style.marginLeft = '5px';
    infoIcon.style.fontWeight = 'normal';

    // Append the info icon within the <th> element
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

const CopyPastas = {
    Invalid: "Invalid Submission",
    Identical: "Package name is identical to another. Please use unique identifiers such as icon/readme and name. Do not upload other user's assets without permission.",
    DLLClone: "This package contains uploaded DLLs of other mods. Do not upload other user's assets without permission.",
    DLLPack: "This package contains uploaded DLLs of other mods. Please instead use dependency strings provided on the mod page in your manifest.",
};

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


    for (const [key, value] of Object.entries(CopyPastas)) {
        
        var newButton = document.createElement('button');
        newButton.textContent = key;
        newButton.type = 'button';
        newButton.className = 'btn btn-primary'
        newButton.value = value;

        newButton.addEventListener('click', function() {
            var rejectionReasonTextareaByName = document.getElementsByName("rejectionReason")[0];
            rejectionReasonTextareaByName.value = this.value;
        });
        
        newButtonDiv.insertAdjacentElement('beforeend', newButton);
    }
}






async function main() {
    let links = new Array();
    
    if (window.location.href.endsWith("/versions/")) {
        await updateTable();
        links = await findDownloadLinks();
        console.log(links);
        await createTimeHeader();
    }
    await setupReview();
}

main();

    