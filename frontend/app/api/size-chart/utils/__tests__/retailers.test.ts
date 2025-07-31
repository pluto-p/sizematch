import { getRetailerFromUrl } from '../retailers';

describe('getRetailerFromUrl', () => {
  test('should correctly identify Uniqlo URLs', () => {
    const urls = [
      'https://www.uniqlo.com/us/en/products/E422990-000/00',
      'https://www.uniqlo.com/jp/ja/products/E422990-000/00',
      'http://uniqlo.com/us/en/products/E422990-000/00',
    ];
    
    urls.forEach(url => {
      expect(getRetailerFromUrl(url)).toBe('uniqlo');
    });
  });
  
  test('should correctly identify Levis URLs', () => {
    const urls = [
      'https://www.levis.com/en-us/products/mens-511-slim-fit-jeans/045111409.html',
      'https://www.levi.com/US/en_US/clothing/men/jeans/511-slim-fit-mens-jeans/p/045111409',
    ];
    
    urls.forEach(url => {
      expect(getRetailerFromUrl(url)).toBe('levis');
    });
  });
  
  test('should correctly identify H&M URLs', () => {
    const urls = [
      'https://www2.hm.com/en_us/productpage.0608945001.html',
      'https://www.h-m.com/en_us/productpage.0608945001.html',
      'https://hm.com/en_us/productpage.0608945001.html',
    ];
    
    urls.forEach(url => {
      expect(getRetailerFromUrl(url)).toBe('hm');
    });
  });
  
  test('should correctly identify Zara URLs', () => {
    const urls = [
      'https://www.zara.com/us/en/cropped-shirt-p02157241.html',
    ];
    
    urls.forEach(url => {
      expect(getRetailerFromUrl(url)).toBe('zara');
    });
  });
  
  test('should correctly identify Gap family URLs', () => {
    const urls = [
      'https://www.gap.com/browse/product.do?pid=4107410220003',
      'https://www.oldnavy.com/browse/product.do?pid=4107410220003',
      'https://www.bananarepublic.com/browse/product.do?pid=4107410220003',
    ];
    
    urls.forEach(url => {
      expect(getRetailerFromUrl(url)).toBe('gap');
    });
  });
  
  test('should correctly identify Nike URLs', () => {
    const urls = [
      'https://www.nike.com/t/sportswear-club-fleece-pullover-hoodie-fGfRCM',
    ];
    
    urls.forEach(url => {
      expect(getRetailerFromUrl(url)).toBe('nike');
    });
  });
  
  test('should correctly identify Adidas URLs', () => {
    const urls = [
      'https://www.adidas.com/us/stan-smith-shoes/FX5502.html',
    ];
    
    urls.forEach(url => {
      expect(getRetailerFromUrl(url)).toBe('adidas');
    });
  });
  
  test('should return null for unsupported retailers', () => {
    const urls = [
      'https://www.amazon.com/product',
      'https://www.walmart.com/ip/item/123456789',
      'https://www.target.com/p/product/-/A-12345678',
      'https://www.example.com',
    ];
    
    urls.forEach(url => {
      expect(getRetailerFromUrl(url)).toBe(null);
    });
  });
  
  test('should handle invalid URLs gracefully', () => {
    const invalidUrls = [
      'not-a-url',
      'http://',
      '',
    ];
    
    invalidUrls.forEach(url => {
      expect(getRetailerFromUrl(url)).toBe(null);
    });
  });
});