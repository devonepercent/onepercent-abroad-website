import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { PRICE } from "./erasmusData";

export interface CartItem {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
}

interface CartContextValue {
  items: CartItem[];
  add: (item: Omit<CartItem, "price"> & { price?: number }) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  count: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "erasmus_cart_v1";

export const ErasmusCartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [items]);

  const add: CartContextValue["add"] = (item) =>
    setItems((prev) =>
      prev.some((x) => x.id === item.id)
        ? prev
        : [...prev, { ...item, price: item.price ?? PRICE }],
    );

  const remove: CartContextValue["remove"] = (id) =>
    setItems((prev) => prev.filter((x) => x.id !== id));

  const clear = () => setItems([]);
  const has = (id: string) => items.some((x) => x.id === id);

  const count = items.length;
  const total = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, clear, has, count, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useErasmusCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useErasmusCart must be used within ErasmusCartProvider");
  return ctx;
};
