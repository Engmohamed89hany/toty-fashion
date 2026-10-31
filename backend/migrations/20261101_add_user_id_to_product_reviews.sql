ALTER TABLE product_reviews
  ADD COLUMN user_id INT NULL AFTER product_id,
  MODIFY COLUMN reviewer_name VARCHAR(100) NOT NULL,
  ADD INDEX idx_product_reviews_user_id (user_id),
  ADD CONSTRAINT fk_product_reviews_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
