import { Component, OnInit, VERSION } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  name = 'Angular ' + VERSION.major;

  constructor(private toastrService: ToastrService) {}

  ngOnInit() {
    this.toastrService.success('Message Success!', 'Title Success!');
  }
}
