import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import ReactLoading from "react-loading";

import api from "../../utils/api";

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 70px 0 46px;
  display: flex;
  flex-wrap: wrap;

  @media screen and (max-width: 1279px) {
    padding: 15px 21px 6px;
  }
`;

const Product = styled(Link)`
  width: calc((100% - 120px) / 3);
  margin: 0 20px 50px;
  flex-shrink: 0;
  text-decoration: none;

  @media screen and (max-width: 1279px) {
    width: calc((100% - 12px) / 2);
    margin: 0 3px 24px;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  vertical-align: middle;
`;

const ProductColors = styled.div`
  margin-top: 20px;
  display: flex;

  @media screen and (max-width: 1279px) {
    margin-top: 8px;
  }
`;

const ProductColor = styled.div`
  width: 24px;
  height: 24px;
  box-shadow: 0px 0px 1px #bbbbbb;
  background-color: ${(props) => props.$colorCode};

  @media screen and (max-width: 1279px) {
    width: 12px;
    height: 12px;
  }

  & + & {
    margin-left: 10px;

    @media screen and (max-width: 1279px) {
      margin-left: 6px;
    }
  }
`;

const ProductTitle = styled.div`
  margin-top: 20px;
  font-size: 20px;
  letter-spacing: 4px;
  color: #3f3a3a;
  line-height: 24px;

  @media screen and (max-width: 1279px) {
    margin-top: 10px;
    font-size: 12px;
    letter-spacing: 2.4px;
    line-height: 14px;
  }
`;

const ProductPrice = styled.div`
  margin-top: 10px;
  font-size: 20px;
  letter-spacing: 4px;
  color: #3f3a3a;
  line-height: 24px;

  @media screen and (max-width: 1279px) {
    margin-top: 8px;
    font-size: 12px;
    letter-spacing: 2.4px;
    line-height: 14px;
  }
`;

const useIntersectionObserver = (ref, options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.unobserve(ref.current);
    };
  }, []);

  return isIntersecting;
};

const Loading = styled(ReactLoading)`
  margin: 0 auto;
`;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const keyword = searchParams.get("keyword");
  const category = searchParams.get("category") || "all";

  const [nextPaging, setNextPaging] = useState(0);

  function fetchProducts() {
    if (isLoading) return;
    setIsLoading(true);

    const loading = async (apiJson) => {
      if (nextPaging === -1) return;
      const response = await apiJson;
      if (nextPaging === 0) {
        setProducts(response.data);
      } else {
        setProducts((prev) => [...prev, ...response.data]);
      }

      response.next_paging
        ? setNextPaging(response.next_paging)
        : setNextPaging(-1);
      setIsLoading(false);
    };

    if (keyword) {
      loading(api.searchProducts(keyword, nextPaging));
    } else {
      loading(api.getProducts(category, nextPaging));
    }
  }

  // useEffect(() => {
  //  async function fetchProducts() {
  //     isFetching = true;
  //     setIsLoading(true);
  //     const response = keyword
  //       ? await api.searchProducts(keyword, nextPaging)
  //       : await api.getProducts(category, nextPaging);
  //     if (nextPaging === 0) {
  //       setProducts(response.data);
  //     } else {
  //       setProducts((prev) => [...prev, ...response.data]);
  //     }
  //     nextPaging = response.next_paging;
  //     isFetching = false;
  //     setIsLoading(false);
  //   }
  //   async function scrollHandler() {
  //     if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
  //       if (nextPaging === undefined) return;
  //       if (isFetching) return;

  //       fetchProducts();
  //     }
  //   }

  //   fetchProducts();

  //   window.addEventListener("scroll", scrollHandler);

  //   return () => {
  //     window.removeEventListener("scroll", scrollHandler);
  //   };
  // }, [keyword, category]);

  const ref = useRef();
  const onScreen = useIntersectionObserver(ref, { threshold: 0.5 });

  useEffect(() => {
    if (!onScreen) return;
    if (nextPaging === undefined) return;

    fetchProducts();
  }, [onScreen]);

  return (
    <>
      <Wrapper>
        {products
          ? products.map(({ id, main_image, colors, title, price }) => (
              <Product key={id} to={`/products/${id}`}>
                <ProductImage src={main_image} />
                <ProductColors>
                  {colors.map(({ code }) => (
                    <ProductColor $colorCode={`#${code}`} key={code} />
                  ))}
                </ProductColors>
                <ProductTitle>{title}</ProductTitle>
                <ProductPrice>TWD.{price}</ProductPrice>
              </Product>
            ))
          : null}
        {isLoading && <Loading type="spinningBubbles" color="#313538" />}
      </Wrapper>
      <div ref={ref}></div>
    </>
  );
};

export default Products;
