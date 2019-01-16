var leukemia_timeline = (function() {
  // Datapoints representing events on the timeline
  var datapoints = [
    { "desc": 'Trip to Urgent Care in CA and stay over at ER', "time_span": ['2017/11/28', '2017/11/29'] },
    { "desc": 'Flight back to Boston', "time_span": ['2017/12/06', '2017/12/06'] },
    { "desc": 'First consultation at Dana Farber', "time_span": ['2017/12/08', '2017/12/08'] },
    { "desc": 'Induction chemotherapy', "time_span": ['2017/12/13', '2018/01/13'] },
    { "desc": 'Consolidation chemotherapy 1', "time_span": ['2018/02/05', '2018/02/10'] },
    { "desc": 'Consolidation chemotherapy 2', "time_span": ['2018/03/18', '2018/03/23'] },
    { "desc": 'Hospitalization for Stem Cell Transplant', "time_span": ['2018/05/03', '2018/05/27'] },
    { "desc": 'Home & return to work', "time_span": ['2018/06/15', '2018/06/15'] },
    { "desc": 'Joined Local News team @FB', "time_span": ['2018/07/30', '2018/07/30'] },
    { "desc": 'PET scan of the chest confirming relapse', "time_span": ['2018/08/08', '2018/08/08'] },
    { "desc": 'Radiation therapy', "time_span": ['2018/08/23', '2018/09/11'] },
    { "desc": 'Appointment with Dr. Wadleigh confirming full relapse', "time_span": ['2018/09/26', '2018/09/26'] },
    { "desc": 'Hospitalization for first failed chemotherapy', "time_span": ['2018/09/27', '2018/11/09'] },
    { "desc": 'Hospitalization for second failed chemotherapy', "time_span": ['2018/11/27', '2019/01/02'] }
  ];

  var pixelsPerDay = 15;
  var numDays = 300;
  var margin = {top: 50, right: 50, bottom: 50, left: 300}
  , width = window.innerWidth - margin.left - margin.right // Use the window's width
  , height = 300 * 15 - margin.top - margin.bottom; // Use the window's height

  // Draw main SVG
  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Set start of axis to be 5 days before first event
  var axisStart = (() => {
    var result = new Date(datapoints[0].time_span[0]);
    result.setDate(result.getDate() - 5);
    return result;
  })();

  // Set end of axis to be 5 days after last event
  var axisEnd = (() => {
    var result = new Date(_.last(datapoints).time_span[1]);
    result.setDate(result.getDate() + 5);
    return result;
  })();

  var yScale = d3.scaleTime()
      .domain([axisStart, axisEnd]) // input
      .range([0, height]); // output

  // Draw y-axis
  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale)
            .tickFormat(d3.timeFormat('%Y'))
            .ticks(1));

  // Draw g group containing two points and a line
  var gEnter = svg.selectAll('.blank')
    .data(datapoints)
    .enter()
    .append('g')
    .attr('id', function(d, i) { return `event-${i}`; });

  gEnter.append('circle')
    .attr('class', 'circle top')
    .attr('cx', 0)
    .attr('cy', function(d) { return yScale(new Date(d.time_span[0])); })
    .attr('fill', '#ffab00')
    .attr('r', 4);

  gEnter.append('circle')
    .attr('class', 'circle botom')
    .attr('cx', 0)
    .attr('cy', function(d) { return yScale(new Date(d.time_span[1])); })
    .attr('fill', '#ffab00')
    .attr('r', 4);

  var lineGenerator = d3.line()
    .x(function() { return 0; })
    .y(function(d) { return yScale(new Date(d)); });

  gEnter.append('path')
    .attr('class', 'line')
    .attr('stroke', '#ffab00')
    .attr('d', function(d) { return lineGenerator(d.time_span); });

  gEnter.append('text')
    .attr('class', 'text')
    .attr('id', function(d, i) { return `desc-${i}`;})
    .attr('x', 0)
    .attr('y', d => yScale(new Date(d.time_span[0])) + 5)
    .attr('fill', '#444')
    .attr('visibility', 'hidden')
    .text(function(d) { return d.desc});

  gEnter.append('text')
    .attr('class', 'text')
    .attr('id', function(d, i) { return `timespan-${i}`;})
    .attr('x', 0)
    .attr('y', function(d, i) { return yScale(new Date(d.time_span[0])) + 5; })
    .attr('fill', '#444')
    .attr('visibility', 'hidden')
    .text(d => formatDate(d.time_span[0]) + (d.time_span[0] !== d.time_span[1]
        ? ` - ${formatDate(d.time_span[1])}`
        : ''));

  function formatDate(d) {
    return d.replace(/([0-9]{4})\/([0-9]{2})\/([0-9]{2})/, "$2/$3/$1");
  }

  window.addEventListener('scroll', _.throttle(windowScroll, 200));

  var onlyLastPointLeft = false;
  function windowScroll() {
    // For the last data point, we increase the viewable yWindow's height, in case
    // the default height (100) can put into view
    var lastPoint = datapoints[datapoints.length - 1];
    var lastPointLength =
        yScale(new Date(lastPoint.time_span[1])) - yScale(new Date(lastPoint.time_span[0]));
    var yWindowHeight = onlyLastPointLeft && lastPointLength < window.innerHeight
      ? window.innerHeight - lastPointLength
      : 100;
    var yWindow = { top: scrollY, bottom: scrollY + yWindowHeight };

    topPoints = _.filter(datapoints, function(point) {
      return (dataPointWithinWindow(point.time_span[0]));
    });

    if (topPoints.length > 0) {
      _.forEach(topPoints, function(topPoint) {
        topPointIdx = _.indexOf(datapoints, topPoint);
        if (topPointIdx === datapoints.length - 2) {
          onlyLastPointLeft = true;
        }

        var selectedGroup = d3.select(`#event-${topPointIdx}`)

        selectedGroup.selectAll('circle').transition().attr('r', '6').duration(500);
        selectedGroup.select(`#desc-${topPointIdx}`)
          .transition()
          .attr('x', 20)
          .attr('visibility', 'visible');
        var timespanText = selectedGroup.select(`#timespan-${topPointIdx}`);
        timespanText.transition()
          .attr('x', -timespanText.node().getComputedTextLength() - 20)
          .attr('visibility', 'visible');
      });
    }

    function dataPointWithinWindow(time) {
      yScaleCoord = yScale(new Date(time)) + margin.top;
      return (yScaleCoord >= yWindow.top && yScaleCoord <= yWindow.bottom);
    }
  }
})();
