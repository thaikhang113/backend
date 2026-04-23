ALTER TABLE Users
ADD COLUMN IF NOT EXISTS id_card_front_image_url TEXT;

ALTER TABLE Users
ADD COLUMN IF NOT EXISTS id_card_back_image_url TEXT;
