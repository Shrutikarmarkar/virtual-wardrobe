export type TagCategory = 'item' | 'color' | 'style' | 'occasion' | 'vibe';

export type Tag = {
  category: TagCategory;
  value: string;
};

export type Outfit = {
  id: string;
  image_url: string;
  label: string;
  tags: Tag[];
  created_at: string;
};

export type TagResponse = {
  label: string;
  tags: Tag[];
};
