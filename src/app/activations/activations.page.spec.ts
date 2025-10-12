import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivationsPage } from './activations.page';

describe('ActivationsPage', () => {
  let component: ActivationsPage;
  let fixture: ComponentFixture<ActivationsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
