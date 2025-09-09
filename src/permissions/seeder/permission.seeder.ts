// src/database/seeders/permission.seeder.ts
import { DataSource } from 'typeorm';
import { Permission } from 'src/entities/Permission.entity';

export const PermissionSeeder = async (dataSource: DataSource) => {
  const permissionRepo = dataSource.getRepository(Permission);

  const permissions = [
    'dashboard',
    'database-tables',
    'activity-logs',
    'users',
    'roles',
    'permissions',
    'assign-roles',
    'assign-permissions',
    'ravis',
    'ravi-add',
    'ravi-edit',
    'ravi-update-serial-no',
    'ravi-status',
    'ravi-publish',
    'name-of-refrences',
    'name-of-reference-add',
    'name-of-reference-edit',
    'name-of-reference-update-serial-no',
    'name-of-reference-status',
    'name-of-reference-publish',
    'title-of-the-books',
    'title-of-the-book-add',
    'title-of-the-book-edit',
    'title-of-the-book-update-serial-no',
    'title-of-the-book-status',
    'title-of-the-book-publish',
    'title-of-the-chapters',
    'title-of-the-chapter-add',
    'title-of-the-chapter-edit',
    'title-of-the-chapter-update-serial-no',
    'title-of-the-chapter-status',
    'title-of-the-chapter-publish',
    'the-subsidiary-topics',
    'the-subsidiary-topic-add',
    'the-subsidiary-topic-edit',
    'the-subsidiary-topic-update-serial-no',
    'the-subsidiary-topic-status',
    'the-subsidiary-topic-publish',
    'title-of-the-hadiths',
    'title-of-the-hadith-add',
    'title-of-the-hadith-edit',
    'title-of-the-hadith-update-serial-no',
    'title-of-the-hadith-status',
    'title-of-the-hadith-publish'
  ];

  const existing = await permissionRepo.find({
    where: permissions.map(name => ({ permission_name: name })),
    select: ['permission_name'],
  });

  const existingNames = new Set(existing.map(p => p.permission_name));

  const now = new Date();
  const created_date = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
  const created_time = now.toTimeString().slice(0, 5); // "HH:MM"

  const toInsert = permissions
    .filter(name => !existingNames.has(name))
    .map(name => ({
      permission_name: name,
      created_date,
      created_time,
    }));

  if (toInsert.length) {
    await permissionRepo.insert(toInsert);
    console.log(`Inserted ${toInsert.length} new permissions.`);
  } else {
    console.log('No new permissions to insert.');
  }
};
