# Product Detail Recommendations Design

## Goal

Replace the mock "猜你喜欢" data on the product detail page with live data from `GET /wxapp/promotions/recommendlike`, and hide the "最近浏览" tab until a real data source exists.

## Scope

- Add a client method for the `recommendlike` endpoint.
- Map the API response into `BCProductRecommendations`'s existing lightweight card model.
- Load recommendations on the product detail page without affecting the main detail SSR flow.
- Hide the recent tab for the product detail page only.

## Design

### Data Flow

- `ItemApiClient` gets a new `getRecommendLikeItems(page, pageSize)` method.
- The product detail page fetches recommendations separately from the main item detail request.
- The raw `GoodsList` payload is mapped into `{ id, name, price, image }`.
- Price stays in yuan for the UI component by converting API fen values with `/ 100`.

### UI Behavior

- `BCProductRecommendations` keeps its existing layout.
- The product detail page passes real `recommendedProducts`.
- The recent tab is hidden via a component prop so other future consumers are not blocked by this page's temporary requirement.
- If the recommendations request fails or returns an empty list, the detail page still renders normally and the recommendations block is hidden.

### Error Handling

- Recommendation fetch failures are logged and downgraded to an empty list.
- No blocking error state is shown because the section is secondary content.

### Testing

- Add a failing transformer/unit test for mapping `recommendlike` payload into recommendation cards.
- Add a failing source-level test for the product detail page using the live recommendation loader and hiding the recent tab.
- Add a failing source-level test for the recommendation component prop that controls the recent tab.
