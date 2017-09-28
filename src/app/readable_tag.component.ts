import { Component, OnInit, ElementRef, Renderer } from '@angular/core';

@Component({
    selector: 'app-readable-tag',
    templateUrl: './readable_tag.component.html',
})
export class ReadableTagComponent  {
  constructor(private el: ElementRef, private renderer: Renderer){}
   display(){
    this.renderer.setElementStyle(this.el.nativeElement.children[1], 'display', 'block')
   }
   hide(){
    this.renderer.setElementStyle(this.el.nativeElement.children[1], 'display', 'none')
   }
}
