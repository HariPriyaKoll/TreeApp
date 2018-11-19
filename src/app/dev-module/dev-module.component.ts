import { Component, ElementRef, OnInit, ViewEncapsulation} from '@angular/core';
import * as d3 from "d3";
import { UserService } from '../services/user.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'main-module',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './dev-module.component.html',
  styleUrls: [
    './dev-module.component.css'
  ],
})
export class DevModuleComponent implements OnInit {

 sampleData =
  {
    "name": "Root",
    "children": [
      { 
        "name": "Child 1",
        "children": [
          { "name": "Child 1-one" ,
              "children":[
                { "name": "Child 1-1-one" },
              ]
           },
          { "name": "Child 1-two",
          "children": [
            { "name": "Child 1-2-one" },
            { "name": "Child 1-2-two" }
          ]
        }
        ]
      },
      { 
          "name": "Child 2",
          "children": [
            { "name": "Child 2-one" },
            { "name": "Child 2-two" }
          ]
       },
       { 
        "name": "Child 3",
        "children": [
          { "name": "Child 3-one" },
          { "name": "Child 3-two" }
        ]
     }, 
     { 
        "name": "Child 4",
        "children": [
          { "name": "Child 4-one" },
          { "name": "Child 4-two" }
        ]
     },
     { 
        "name": "Child 5",
        "children": [
          { "name": "Child 5-one" },
          { "name": "Child 5-two" }
        ]
     }
       
    ]
  };
    dataList: any;
    margin: any;
    width: number;
    height: number;
    svg: any;
    duration: number;
    root: any;
    tree: any;
    treeData: any;
    nodes: any;
    links: any;
    //items: any[];
    selectedPaths:any;
    menu:any;

    constructor(private userService: UserService,private alertService: AlertService) { }

    ngOnInit() {
        this.getSavedHistory();
        this.setData();
    }
    
    getSavedHistory(){
        this.userService.getUserHistory().subscribe(
            data => { 
             this.selectedPaths = data;
             console.log("saved nodes",this.selectedPaths);
            },
            err => {
                console.log(err);
            },      
            () => console.log('User History')
            );
            
    }
    setData() {
       // Define a context menu
       var self=this;
       this.menu = [
        {
           title: "Save",
           action: function(elm, d, i) {
           console.log('Saved Node "' + d.data.name);
           self.save(d,self);
           }
       }, 
       {
           title: 'Show Child Nodes',
           action: function(elm, d, i) {
           self.expand(d);
           self.updateChart(d);
           console.log('Exapanded' + d.data.name);
           }
           
       }, 
       {
           title: 'Hide Child Nodes',
           action: function(elm, d, i) {
           self.collapse(d);
           self.updateChart(d);
           console.log('Collapsed "' + d.data.name);
           }
       }];
      this.margin = {top: 20, right: 90, bottom: 30, left: 90};
      this.width = 960 - this.margin.right - this.margin.left;
      this.height = 500 - this.margin.top - this.margin.bottom;
        this.svg = d3.select('svg')
            .attr('width', this.width + this.margin.right + this.margin.left)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        this.duration = 750;
        this.tree = d3.tree()
            .size([this.height, this.width]);

        this.root = d3.hierarchy(this.sampleData, (d) => { return d.children; });
        this.root.x0 = this.height / 2;
        this.root.y0 = 0;
        // Collapse after the second level
        this.root.children.forEach(this.collapse.bind(this));
        this.updateChart(this.root);
      
    }
    
     save(d,self){
        console.log("saved nodes",self.selectedPaths);
            var found=0;
            self.selectedPaths.forEach(element => {
                if(element.visitedNode==d.data.name){
                    found++;
                }
            });
            if(found==0){
                var selectedNode=d.data.name;
                var selectedPath=[];
                while (d.parent) {
                    //selectedPath+=d.data.name;
                    d = d.parent;
                    selectedPath.push(d.data.name);
                  }
                selectedPath.unshift(selectedNode);
                var finalPath=selectedPath.reverse().join(">");
                console.log("selectedPath",finalPath);
                let id = 1;
                if (self.selectedPaths.length > 0) {
                    let maximum = Math.max.apply(Math, self.selectedPaths.map(function (f) { return f.id; }));
                    id = maximum + 1;
                }
                let new_visitedNode = {"id": id, "visitedNode":selectedNode,"path":finalPath};
                self.selectedPaths.push(new_visitedNode);
                self.userService.saveUserHistory({"name":selectedNode,"path":finalPath})     
                .subscribe(
                data => {
                    self.alertService.success('Saved successfully', true);
                },
                error => {
                    self.alertService.error(error);
                });
            }
            else{
                self.alertService.error("Node History Saved Already");
            }  
    }
   
  
    click(d) {
        //if(event.button==0 && event.type=="click"){
            console.log('left-click');
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            this.updateChart(d);
        //}
        //else if(event.button==2 && event.type=="contextmenu"){
            //console.log('right-click');
            // localStorage.setItem("visitedData",d.data.name);
            // console.log("parent",d.parent);
            // console.log("history",localStorage.getItem("visitedData"));
            // var selectedNode=d.data.name;
            // this.save(selectedNode);
         //}     
    }
      
     //basically a way to get the path to an object
	 searchTree(obj,search,path){
		if(obj.data.name === search){ //if search is found return, add the object to the path and return it
			path.push(obj);
			return path;
		}
		else if(obj.children || obj._children){ //if children are collapsed d3 object will have them instantiated as _children
			var children = (obj.children) ? obj.children : obj._children;
			for(var i=0;i<children.length;i++){
				path.push(obj);// Assuming this path is the right one
				var found = this.searchTree(children[i],search,path);
				if(found){// we were right, this should return the bubbled-up path from the first if statement
					return found;
				}
				else{//we were wrong, remove this parent from the path and continue iterating
					path.pop();
				}
			}
		}
		else{//not the right object, return false so it will continue to iterate in the loop
			return false;
		}
	}
     
      openPaths(paths){
		for(var i =0;i<paths.length;i++){
            //paths[i].class = 'none';
            if(paths[i].id !== "1"){//i.e. not root
				paths[i].class = 'found';
				if(paths[i]._children){ //if children are hidden: open them, otherwise: don't do anything
					paths[i].children = paths[i]._children;
	    			paths[i]._children = null;
				}
				this.updateChart(paths[i]);
			}
		}
	}

    
    collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(this.collapse.bind(this));
        d.children = null;
      }
    }

   collapseAll() {
      this.root.children.forEach(this.collapse.bind(this));
      this.collapse(this.root)
      this.updateChart(this.root);
     }
    
     expand(d){   
      var children = (d.children)?d.children:d._children;
      if (d._children) {        
          d.children = d._children;
          d._children = null;       
      }
      if(children)
        children.forEach(this.expand.bind(this));
    }
  
     expandAll() {
      this.expand(this.root)
      this.updateChart(this.root);
      }

    updateChart(source) {
        let i = 0;
        console.log(source);
        this.treeData = this.tree(this.root);
        this.nodes = this.treeData.descendants();
        this.links = this.treeData.descendants().slice(1);
        this.nodes.forEach((d) => { d.y = d.depth * 180 });

        let node = this.svg.selectAll('g.node')
            .data(this.nodes, (d) => { return d.id || (d.id = ++i); });

        let nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', (d) => {
                return 'translate(' + source.y0 + ',' + source.x0 + ')';
            })
            .on('click', (d) => {this.click(d)})
            .on('contextmenu', contextMenu(this.menu));
            // to react on right-clicking
            // .on("contextmenu", function (d, i) {
            //     d3.event.preventDefault();
            // });

        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-6)
            .style('fill', (d) => {
                return d._children ? 'lightsteelblue' : '#fff';
            });

        nodeEnter.append('text')
            .attr('dy', '.35em')
            .attr('x', (d) => {
                return d.children || d._children ? -13 : 13;
            })
            .attr('text-anchor', (d) => {
                return d.children || d._children ? 'end' : 'start';
            })
            .style('font', '12px sans-serif')
            .text((d) => { return d.data.name; });

        let nodeUpdate = nodeEnter.merge(node);

        nodeUpdate.transition()
            .duration(this.duration)
            .attr('transform', (d) => {
                return 'translate(' + d.y + ',' + d.x + ')';
            });

        nodeUpdate.select('circle.node')
            .attr('r', 10)
            .style('stroke-width', '3px')
            // .style('stroke', 'steelblue')
            // .style('fill', (d) => {
            //     return d._children ? 'lightsteelblue' : '#fff';
            // })
            .attr('cursor', 'pointer')
            .style("fill", function(d) {
				if(d.class === "found"){
					return "#ff4136"; //red
				}
				else if(d._children){
					return "lightsteelblue";
				}
				else{
					return "#fff";
				}
			})
			.style("stroke", function(d) {
				if(d.class === "found"){
					return "#ff4136"; //red
				}
		   });

        let nodeExit = node.exit().transition()
            .duration(this.duration)
            .attr('transform', (d) => {
                return 'translate(' + source.y + ',' + source.x + ')';
            })
            .remove();

        nodeExit.select('circle')
            .attr('r', 1e-6);

        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        let link = this.svg.selectAll('path.link')
            .data(this.links, (d) => { return d.id; });

        let linkEnter = link.enter().insert('path', 'g')
            .attr('class', 'link')
            .style('fill', 'none')
            .style('stroke', '#ccc')
            .style('stroke-width', '2px')
            .attr('d', function (d) {
                let o = { x: source.x0, y: source.y0 };
                return diagonal(o, o);
            });

        let linkUpdate = linkEnter.merge(link);

        linkUpdate.transition()
            .duration(this.duration)
            .attr('d', (d) => { return diagonal(d, d.parent); })
            .style("stroke",function(d){
				if(d.class==="found"){
					return "#ff4136";
                }
             });

        let linkExit = link.exit().transition()
            .duration(this.duration)
            .attr('d', function (d) {
                let o = { x: source.x, y: source.y };
                return diagonal(o, o);
            })
            .remove();

        this.nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
        function diagonal(s, d) {
            let path = `M ${s.y} ${s.x}
                    C ${(s.y + d.y) / 2} ${s.x},
                    ${(s.y + d.y) / 2} ${d.x},
                    ${d.y} ${d.x}`;
            return path;
        };
        function contextMenu(menu) {
            console.log('right-click');
            // create the div element that will hold the context menu
            d3.selectAll('.d3-context-menu').data([1])
                .enter()
                .append('div')
                .attr('class', 'd3-context-menu');
        
            // close menu
               d3.select('body').on('click.d3-context-menu', function() {
                d3.select('.d3-context-menu').style('display', 'none');
            });
        
            // this gets executed when a contextmenu event occurs
            return function(data, index) {	
                var elm = this;
        
                d3.selectAll('.d3-context-menu').html('');
                var list = d3.selectAll('.d3-context-menu').append('ul');
                list.selectAll('li').data(menu).enter()
                    .append('li')
                    .html(function(d) {
                        return d.title;
                    })
                    .on('click', function(d, i) {
                        d.action(elm, data, index);
                        d3.select('.d3-context-menu').style('display', 'none');
                    });
                    
                // display context menu
                d3.select('.d3-context-menu')
                    .style('left', (d3.event.pageX - 2) + 'px')
                    .style('top', (d3.event.pageY - 2) + 'px')
                    .style('display', 'block');
        
                d3.event.preventDefault();
            };
        };
    }
    selectedIndex: number;
    showSelectedPath(index: number,path){
        this.selectedIndex = index;
        var paths = this.searchTree(this.root,path,[]);
		if(typeof(paths) !== "undefined"){
			this.openPaths(paths);
		}
		else{
			alert(path+" not found!");
		} 
    }
}