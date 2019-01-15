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
  var margin = {top: 50, right: 50, bottom: 50, left: 50}
  , width = window.innerWidth - margin.left - margin.right // Use the window's width
  , height = 300 * 15 - margin.top - margin.bottom; // Use the window's height

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

  // Draw main SVG
  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Draw y-axis
  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat('%b')));

  var gEnter = svg.selectAll('.blank')
    .data(datapoints)
    .enter()
    .append('g');

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

  window.addEventListener('scroll', _.throttle(windowScroll, 200));

  var yWindow = { top: scrollY, bottom: scrollY + 50 };
  function windowScroll() {
    topPoints = _.find(datapoints, function(point) {
      return (dataPointWithinWindow(point.time_span[0]));
    });

    bottomPoints = _.find(datapoints, function(point) {
      return (dataPointWithinWindow(point.time_span[1]));
    });

    d3.select('svg').selectAll('circle');

    function dataPointWithinWindow(time) {
      yScaleCoord = yScale(new Date(time));
      return (yScaleCoord > yWindow.top && yScaleCoord < yWindow.bottom)
    }
  }

  // gEnter
  //   .on('mouseenter', onMouseEnter)
  //   .on('mouseleave', onMouseLeave);

  // // function onMouseEnter(d) {
  //     var str = d.time_span[0] +
  //       (d.time_span[0] === d.time_span[1]
  //         ? ''
  //         : ` - ${d.time_span[1]}`)
  //       + `: ${d.desc}`;
  //
  //     svg.append('text')
  //       .attr('class', 'desc')
  //       .attr('id', 'desc')
  //       .attr('x', 0)
  //       .attr('y', yScale(new Date(d.time_span[0])) + 5)
  //       .attr('fill', '#444')
  //       .attr('visibility', 'hidden')
  //       .text(str);
  //
  //     svg.select('#desc')
  //       .transition()
  //       .attr('x', 20)
  //       .duration(500)
  //       .attr('visibility', 'visible');
  //
  //     d3.select(this).selectAll('circle')
  //       .transition()
  //       .attr('r', 5)
  //       .attr('fill', '#444')
  //       .duration(500);
  //
  //     d3.select(this).selectAll('path')
  //       .transition()
  //       .attr('stroke', '#444')
  //       .duration(500);
  // }
  //
  // function onMouseLeave(d) {
  //   d3.select('#desc').remove();
  //   d3.select(this).selectAll('circle')
  //     .attr('r', 5)
  //     .attr('fill', '#ffab00');
  //   d3.select(this).selectAll('path')
  //     .attr('stroke', '#ffab00');
  // }
})();
