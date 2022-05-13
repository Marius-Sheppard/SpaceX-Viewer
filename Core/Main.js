
let Pages     = [["LAUNCHES", "ALL", "LATEST", "UPCOMING" ,"PAST"], ["DRAGONS","ALL"], ["CREW","ALL"], ["CORES","ALL"], ["SHIPS","ALL"], ["STARLINK","ALL"]];
let Endpoints = [["https://api.spacexdata.com/v5/launches", "https://api.spacexdata.com/v5/launches/latest", "https://api.spacexdata.com/latest/launches/upcoming", "https://api.spacexdata.com/latest/launches/past"], ["", "","","",""], ["", "","","",""], ["", "","","",""], ["", "","","",""]];
let Colors    = ["#41729F", "#5885AF", "#274472", "#C3E0E5", "#41729F", "#5885AF"];
let CurrentPage = localStorage.getItem("CurrentPage");
let CurrentSubPage = localStorage.getItem("CurrentSubPage");

if(CurrentPage == null)
{
    CurrentPage = 0;
    localStorage.setItem("CurrentPage", "0");
}

if(CurrentSubPage == null)
{
    CurrentSubPage = 0;
    localStorage.setItem("CurrentSubPage", "0");
}



var ROOT = document.querySelector(':root');
let CachedData = [];
let ViewedElements = 0;
var FiredEvent = false;

function GetElement(ClassOrID)
{
    if(document.getElementById(ClassOrID))
        return document.getElementById(ClassOrID);
    if(document.getElementsByClassName(ClassOrID))
        return document.getElementsByClassName(ClassOrID)[0];
    else
        return false;
}

function ComputeCountdown(LaunchDate)
{
    let CurrentDate = new Date();
    let LaunchDateTime = new Date(LaunchDate);
    let Difference = LaunchDateTime - CurrentDate;
    let Days = Math.floor(Difference / (1000 * 60 * 60 * 24));
    let Hours = Math.floor((Difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let Minutes = Math.floor((Difference % (1000 * 60 * 60)) / (1000 * 60));
    let Seconds = Math.floor((Difference % (1000 * 60)) / 1000);

    if(Days < 0)
       Days = "00";
    if(Hours < 0)
        Hours = "00";
    if(Minutes < 0)
        Minutes = "00";
    if(Seconds < 0)
        Seconds = "00";

    if(Days < 10)
        Days = "0" + Days;
    if(Hours < 10)
        Hours = "0" + Hours;
    if(Minutes < 10)
        Minutes = "0" + Minutes;
    if(Seconds < 10)
        Seconds = "0" + Seconds;
    
    return [Days, Hours, Minutes, Seconds];
}

document.addEventListener('scroll', function() 
{
    if(window.scrollY < 200)
        GetElement("up-arrow").style = "display: none;";
    else
    {
        GetElement("up-arrow").style = "display: block;";

        if (window.pageYOffset + window.innerHeight >= document.documentElement.scrollHeight - 50 && ViewedElements + 2 <= CachedData.length)  // reached bottom of page    
            AddContent(CachedData, ViewedElements, ViewedElements + 2);
        
    }
});

GetElement("up-arrow").onclick = function()
{
  window.scrollTo(0, 0);
}

function RunTimer(Breaker, Index)
{
    setTimeout(function()
    {  
        let TTime, LaunchDate, Err = false;
        try
        {
            LaunchDate = CachedData[Index]["date_utc"].split("T")[0];
            TTime = ComputeCountdown(LaunchDate);  
        }
        catch(err)
        {
            Err = true;
        }

        if(Err == false)
        {
            Countdown = "T - " + TTime[0] + ":" + TTime[1] + ":" + TTime[2] + ":" + TTime[3];
            document.getElementsByClassName("go-time")[Index].innerHTML = Countdown;
            if(Breaker == CurrentSubPage)
                RunTimer(Breaker, Index);
        }
    },1000);    
}

function AddContent(Data, DLimit, ULimit) // limit how many items to display, to avoid lag  ( DLimit <= ULimit ) 
{
    ViewedElements = ULimit;
    CachedData = Data; // save data to load chunks from it as user scrolls
    if(Pages[CurrentPage][0] == "LAUNCHES")
    {
        for(var i = DLimit; i < ULimit; i++)
        {
            let Image = Data[i]["links"]["patch"]["large"];
            if(Image == null)
                Image = "../Resources/Logo_400.png";

            let Description = Data[i]["details"];
            if(Description == null)
                Description = "NO AVAILABLE DESCRIPTION";
            else
            {
                // 200 words or less
                if(Description.length > 200)
                {
                    for(let i = 200; i < Description.length; i++)
                        if(Description[i] == " ")
                        {
                            Description = Description.substring(0, i) + " ...";
                            break;
                        }
                }
            }

            let LaunchDate = Data[i]["date_utc"].split("T")[0];
            let LaunchTime = Data[i]["date_utc"].split("T")[1].split("Z")[0].split('.')[0] + " UTC";
            let Countdown  = ""
            if(CurrentSubPage == 2)
            {
                let TTime = ComputeCountdown(LaunchDate);
                RunTimer(CurrentSubPage, i);
                Countdown = "T - " + TTime[0] + ":" + TTime[1] + ":" + TTime[2] + ":" + TTime[3];
            }

            GetElement("page-list-ul").innerHTML += "<li class = 'page-list-li'><h3>" + LaunchDate + "</h3><h4>" + LaunchTime + "</h4><img src = " + Image + "></img><h1>" + Description + ".</h1><h2 class = 'go-time'>" + Countdown + "</h2><div class = 'more-info'><a>MORE INFO</a></div></li>";
            document.getElementsByClassName("more-info")[i].onclick = function()
            {
                console.log("AI SUPTO");
                document.location.href =  "../Pages/Detais.html";

             }
        }
    }

    if(Pages[CurrentPage][0] == "DRAGONS")
    {
        
    }


 
 }

function LoadContent()
{
    let REQ = new XMLHttpRequest();
    REQ.open("GET", Endpoints[CurrentPage][CurrentSubPage], true);
    REQ.onreadystatechange = function()
    {
        if(REQ.readyState == 4 && REQ.status == 200) // successfull request
        {
            let Data = JSON.parse(REQ.responseText);
            if(Data.length == undefined)
            {
                const A = [];
                A.push(Data);
                Data = A;
            }

            if(Data.length > 3)
                AddContent(Data, 0, 3)
            else
                AddContent(Data, 0, Data.length);
        }
    }
    REQ.send();
}

function LoadPage()
{
    GetElement("page-content").innerHTML = "";

    
    for(var i = 1; i < Pages[CurrentPage].length; i++)
        GetElement("page-content").innerHTML += "<div class = 'selectable'><h1>" + Pages[CurrentPage][i] + "</h1></div>";

    document.getElementsByClassName("selectable")[CurrentSubPage].classList.add("active-selection");

    Selectables = document.getElementsByClassName("selectable");
    for(let i = 0; i < Selectables.length; i++)
    {
        Selectables[i].addEventListener("click", function()
        {       
            CurrentSubPage = i;
            localStorage.setItem("CurrentSubPage", i);
            GetElement("page-list-ul").innerHTML = "";
            LoadContent();
            for(let j = 0; j < Selectables.length; j++)
                Selectables[j].classList.remove("active-selection");
            this.classList.add("active-selection");
        });
    }
    
    LoadContent();
}

function ChangePage(Page)
{
    localStorage.setItem("CurrentPage", Page);
    GetElement("page-list-ul").innerHTML = "";
    CurrentPage = Page;
    GetElement("type-text").innerHTML = "<h1>  # " + Pages[CurrentPage][0] + "</h1>";
    ROOT.style.setProperty('--accent-color', Colors[CurrentPage]);
    LoadPage();
}

GetElement("type-button-right").onclick = function()
{
    if(CurrentPage < Pages.length - 1)
        CurrentPage++;
    else
        CurrentPage = 0;
    ChangePage(CurrentPage);
}

GetElement("type-button-left").onclick = function()
{
    if(CurrentPage > 0)
        CurrentPage--;
    else
        CurrentPage = Pages.length - 1;
    ChangePage(CurrentPage);
}


ChangePage(CurrentPage);
