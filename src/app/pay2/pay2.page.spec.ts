import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pay2Page } from './pay2.page';

describe('Pay2Page', () => {
  let component: Pay2Page;
  let fixture: ComponentFixture<Pay2Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Pay2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
