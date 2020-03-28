// content.js

var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Content-Type", "text/plain");

function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function get_label_html(label, src) {
  let color = "red";
  if (label.toUpperCase() == "ONDUIDELIJK") {
    color = "orange";
  }
  if (label.toUpperCase() == "NO MATCH") {
    color = "grey";
  }

  if (src == "hln")
    return (
      '<span class="fact-check-label label-onwaar" style="' +
      "position: absolute;" +
      "display: block;" +
      "top: 10px;" +
      "left: -20px;" +
      "background-color: " +
      color +
      ";" +
      "z-index: 999999999;" +
      "font-size: 10px;" +
      "color: white;" +
      "/* width: 200px; */" +
      "/* height: 100px; */" +
      "line-height: 10px;" +
      "padding: 10px;" +
      '">' +
      label +
      "</span>"
    );
  else
    return (
      '<span class="fact-check-label label-onwaar" style="' +
      "position: absolute;" +
      "display: block;" +
      "top: 150px;" +
      "left: -20px;" +
      "background-color: " +
      color +
      ";" +
      "z-index: 999999999;" +
      "font-size: 30px;" +
      "color: white;" +
      "/* width: 200px; */" +
      "/* height: 100px; */" +
      "line-height: 30px;" +
      "padding: 10px;" +
      '">' +
      label +
      "</span>"
    );
}

function init() {
  console.log("init Hack the Crisis", chrome.runtime);
  //chrome.browserAction.setBadgeText({ text: "0" }); // We have 10+ unread items.

  var tablink = window.location.href;

  console.log("tablink is:", tablink);

  switch (tablink) {
    case "https://www.facebook.com/":
      run_fb();
      break;
    case "https://www.hln.be/":
      run_hln();
      break;
    default:
      console.log("site not supported");
      break;
  }
}
init();

function run_hln() {
  let arr_articles = [];
  let arr_txts = [];

  let s_i = 0;

  $(".page-section").each(function() {
    s_i++;
    console.log("Section", s_i);
    $(this)
      .find("article")
      .each(function() {
        console.log("ARTICLE");
        $(this)
          .find("h1")
          .each(function() {
            const txt = $(this)
              .text()
              .trim();
            //console.log(txt.length, txt);
          });

        if ($(this).find("picture").length && $(this).find("h1").length) {
          const post = this;
          const txt = $(this)
            .find("h1")
            .first()
            .text()
            .trim();

          var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify([txt]),
            redirect: "follow"
          };

          fetch("https://api-v2.factrank.org/match", requestOptions)
            .then(response => response.json())
            .then(result => {
              console.log("Res", result);

              //for (var a = 0; a < result.length; a++) {
              //const _txt = arr_txts[a];
              //const _post = $(arr_articles[a]);

              if (
                result[0].hasOwnProperty("matched") &&
                result[0].matched === false
              ) {
                console.log("No match", txt);

                $(post)
                  .css("position", "relative")
                  .append(get_label_html("NO MATCH", "hln"));
              } else {
                console.log("Match", txt, result[0]);
                $(post)
                  .css("position", "relative")
                  .append(get_label_html(result[0].conclusion, "hln"));
              }
              //}

              //console.log($(post).find("img.scaledImageFitWidth.img").length);
            })
            .catch(error => console.log("error", error));

          //arr_txts.push(txt);
          //arr_articles.push(post);

          //console.log("valid");
        } else {
          console.log(
            "invalid",
            $(this).find("picture").length,
            $(this).find("h1").length
          );
        }

        /*
      $(this)
        .find("h1")
        .each(function() {
          const txt = $(this)
            .text()
            .trim();
          console.log(txt.length, txt);
        });
        */
      });
  });
  /*
  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(arr_txts),
    redirect: "follow"
  };

  fetch("https://api-v2.factrank.org/match", requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log("Res", result);

      for (var a = 0; a < result.length; a++) {
        const _txt = arr_txts[a];
        const _post = $(arr_articles[a]);

        if (
          result[a].hasOwnProperty("matched") &&
          result[a].matched === false
        ) {
          console.log("No match", _txt);

          $(_post)
            .css("position", "relative")
            .append(get_label_html("NO MATCH " + a, "hln"));
        } else {
          console.log("Match", _txt, result[a]);
          $(_post)
            .css("position", "relative")
            .append(get_label_html(result[a].conclusion + " " + a, "hln"));
        }
      }

      //console.log($(post).find("img.scaledImageFitWidth.img").length);
    })
    .catch(error => console.log("error", error));
    */
}

function run_fb() {
  var demo_post = document.createElement("div");
  demo_post.innerHTML = article_html;
  insertAfter(document.getElementById("substream_0"), demo_post);

  let i = 0;
  let found = [];
  setInterval(function() {
    $('a[aria-label][target="_blank"]').each(function() {
      var post = $(this).closest("[data-dedupekey]");
      const txt = $(this)
        .attr("aria-label")
        .trim();

      if (
        !$(post).is(":visible") ||
        post.hasClass("check-post-attr") ||
        found.indexOf(txt) > -1
      ) {
        // console.log("Already processed", post.data("check-id"), txt);
      } else {
        console.log("NEW!", "visible?:", $(post).is(":visible"));
        post.addClass("check-post-attr");
        post.data("check-id", i);
        found.push(txt);
        console.log("Header found:", i, txt);
        //chrome.browserAction.setBadgeText({ text: found.length + "" }); // We have 10+ unread items.

        var requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify([txt]),
          redirect: "follow"
        };

        fetch("https://api-v2.factrank.org/match", requestOptions)
          .then(response => response.json())
          .then(result => {
            console.log("Res", result, txt);

            const img_container = $(post)
              .find("img.scaledImageFitWidth.img")
              .parent("div");

            if (
              result[0].hasOwnProperty("matched") &&
              result[0].matched === false
            ) {
              console.log("No match");
              $(post).append(get_label_html("NO MATCH", "fb"));
            } else {
              $(post).append(get_label_html(result[0].conclusion, "fb"));
            }

            //console.log($(post).find("img.scaledImageFitWidth.img").length);
          })
          .catch(error => console.log("error", error));
      }

      i++;
    });
  }, 500);
}

/*
// Inform the background page that
// this tab should have a page-action
chrome.runtime.sendMessage({
  from: "content",
  subject: "showPageAction"
});
*/
