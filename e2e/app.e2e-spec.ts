import { ExploreRxJSPage } from './app.po';

describe('explore-rx-js App', function() {
  let page: ExploreRxJSPage;

  beforeEach(() => {
    page = new ExploreRxJSPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
