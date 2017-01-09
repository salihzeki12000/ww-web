import { WwWebPage } from './app.po';

describe('ww-web App', function() {
  let page: WwWebPage;

  beforeEach(() => {
    page = new WwWebPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
